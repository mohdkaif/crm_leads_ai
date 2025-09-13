import connectDB from './mongodb'
import AssignmentRule from '../models/AssignmentRule'
import LeadAssignment from '../models/LeadAssignment'
import User from '../models/User'
import Lead from '../models/Lead'

// Auto-assign lead based on rules
export const autoAssignLead = async (leadId: string, assignedBy: string) => {
  try {
    await connectDB()

    // Get the lead
    const lead = await Lead.findById(leadId)
    if (!lead) {
      throw new Error('Lead not found')
    }

    // Get all active assignment rules sorted by priority
    const rules = await AssignmentRule.find({ isActive: true })
      .populate('assignment.userId', 'firstName lastName email role skills')
      .populate('fallback.userId', 'firstName lastName email role skills')
      .sort({ priority: -1 })

    // Find the first matching rule
    let matchedRule = null
    for (const rule of rules) {
      if (await matchesRule(lead, rule)) {
        matchedRule = rule
        break
      }
    }

    if (!matchedRule) {
      // Use fallback assignment if no rules match
      return await fallbackAssignment(leadId, assignedBy)
    }

    // Assign based on rule
    const assignedUser = await findBestUser(lead, matchedRule)
    if (!assignedUser) {
      // Use fallback if no suitable user found
      return await fallbackAssignment(leadId, assignedBy)
    }

    // Create assignment record
    const assignment = new LeadAssignment({
      leadId,
      assignedTo: assignedUser._id,
      assignedBy,
      assignmentRuleId: matchedRule._id,
      assignmentType: 'rule_based',
      status: 'active',
      metadata: {
        ruleName: matchedRule.name,
        assignmentScore: await calculateAssignmentScore(lead, assignedUser, matchedRule),
        skillMatch: matchedRule.assignment.skillRequirements || [],
        regionMatch: lead.region || '',
        sourceMatch: lead.source || ''
      }
    })

    await assignment.save()

    // Update lead assignedTo field
    await Lead.findByIdAndUpdate(leadId, { 
      assignedTo: assignedUser._id,
      status: 'assigned'
    })

    return {
      success: true,
      assignment,
      user: assignedUser,
      rule: matchedRule
    }
  } catch (error) {
    console.error('Error in auto-assignment:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Check if lead matches a rule
const matchesRule = async (lead: any, rule: any): Promise<boolean> => {
  const conditions = rule.conditions

  // Check regions
  if (conditions.regions && conditions.regions.length > 0) {
    if (!lead.region || !conditions.regions.includes(lead.region)) {
      return false
    }
  }

  // Check lead sources
  if (conditions.leadSources && conditions.leadSources.length > 0) {
    if (!lead.source || !conditions.leadSources.includes(lead.source)) {
      return false
    }
  }

  // Check lead value
  if (conditions.leadValue) {
    const leadValue = lead.estimatedValue || 0
    if (conditions.leadValue.min && leadValue < conditions.leadValue.min) {
      return false
    }
    if (conditions.leadValue.max && leadValue > conditions.leadValue.max) {
      return false
    }
  }

  // Check lead status
  if (conditions.leadStatus && conditions.leadStatus.length > 0) {
    if (!lead.status || !conditions.leadStatus.includes(lead.status)) {
      return false
    }
  }

  // Check custom fields
  if (conditions.customFields && conditions.customFields.length > 0) {
    for (const field of conditions.customFields) {
      const leadValue = lead.customFields?.[field.field]
      if (!evaluateCustomField(leadValue, field.operator, field.value)) {
        return false
      }
    }
  }

  return true
}

// Evaluate custom field condition
const evaluateCustomField = (leadValue: any, operator: string, ruleValue: any): boolean => {
  if (leadValue === undefined || leadValue === null) return false

  switch (operator) {
    case 'equals':
      return leadValue === ruleValue
    case 'contains':
      return String(leadValue).toLowerCase().includes(String(ruleValue).toLowerCase())
    case 'starts_with':
      return String(leadValue).toLowerCase().startsWith(String(ruleValue).toLowerCase())
    case 'ends_with':
      return String(leadValue).toLowerCase().endsWith(String(ruleValue).toLowerCase())
    case 'greater_than':
      return Number(leadValue) > Number(ruleValue)
    case 'less_than':
      return Number(leadValue) < Number(ruleValue)
    default:
      return false
  }
}

// Find the best user for assignment
const findBestUser = async (lead: any, rule: any) => {
  const assignment = rule.assignment

  switch (assignment.type) {
    case 'specific_user':
      return assignment.userId

    case 'round_robin':
      return await findRoundRobinUser(assignment)

    case 'least_assigned':
      return await findLeastAssignedUser(assignment)

    case 'most_available':
      return await findMostAvailableUser(assignment)

    case 'skill_based':
      return await findSkillBasedUser(lead, assignment)

    default:
      return null
  }
}

// Round robin assignment
const findRoundRobinUser = async (assignment: any) => {
  // Get all active users
  const users = await User.find({ 
    status: 'active',
    role: { $in: ['sales', 'manager'] }
  }).sort({ lastAssignment: 1 })

  if (users.length === 0) return null

  // Find user with oldest assignment
  const user = users[0]
  
  // Update last assignment time
  await User.findByIdAndUpdate(user._id, { lastAssignment: new Date() })
  
  return user
}

// Least assigned user
const findLeastAssignedUser = async (assignment: any) => {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))

  // Get assignment counts for today
  const assignmentCounts = await LeadAssignment.aggregate([
    {
      $match: {
        assignedAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$assignedTo',
        count: { $sum: 1 }
      }
    }
  ])

  // Get all active users
  const users = await User.find({ 
    status: 'active',
    role: { $in: ['sales', 'manager'] }
  })

  // Find user with least assignments
  let bestUser = null
  let minAssignments = Infinity

  for (const user of users) {
    const userAssignments = assignmentCounts.find(a => a._id.toString() === user._id.toString())
    const count = userAssignments ? userAssignments.count : 0

    // Check daily limit
    if (assignment.maxLeadsPerDay && count >= assignment.maxLeadsPerDay) {
      continue
    }

    if (count < minAssignments) {
      minAssignments = count
      bestUser = user
    }
  }

  return bestUser
}

// Most available user (based on working hours)
const findMostAvailableUser = async (assignment: any) => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentDay = now.getDay()

  // Get all active users
  const users = await User.find({ 
    status: 'active',
    role: { $in: ['sales', 'manager'] }
  })

  // Filter users by working hours
  const availableUsers = users.filter(user => {
    if (!assignment.workingHours) return true

    const { start, end, workingDays } = assignment.workingHours
    const startHour = parseInt(start.split(':')[0])
    const endHour = parseInt(end.split(':')[0])

    return workingDays.includes(currentDay) && 
           currentHour >= startHour && 
           currentHour < endHour
  })

  if (availableUsers.length === 0) return null

  // Return first available user (could be enhanced with more logic)
  return availableUsers[0]
}

// Skill-based assignment
const findSkillBasedUser = async (lead: any, assignment: any) => {
  const requiredSkills = assignment.skillRequirements || []
  
  if (requiredSkills.length === 0) return null

  // Get users with matching skills
  const users = await User.find({
    status: 'active',
    role: { $in: ['sales', 'manager'] },
    skills: { $in: requiredSkills }
  })

  if (users.length === 0) return null

  // Find user with best skill match
  let bestUser = null
  let bestScore = 0

  for (const user of users) {
    const userSkills = user.skills || []
    const matchingSkills = requiredSkills.filter(skill => userSkills.includes(skill))
    const score = matchingSkills.length / requiredSkills.length

    if (score > bestScore) {
      bestScore = score
      bestUser = user
    }
  }

  return bestUser
}

// Fallback assignment
const fallbackAssignment = async (leadId: string, assignedBy: string) => {
  // Get any active user
  const user = await User.findOne({ 
    status: 'active',
    role: { $in: ['sales', 'manager'] }
  })

  if (!user) {
    throw new Error('No active users available for assignment')
  }

  // Create assignment record
  const assignment = new LeadAssignment({
    leadId,
    assignedTo: user._id,
    assignedBy,
    assignmentType: 'automatic',
    status: 'active'
  })

  await assignment.save()

  // Update lead
  await Lead.findByIdAndUpdate(leadId, { 
    assignedTo: user._id,
    status: 'assigned'
  })

  return {
    success: true,
    assignment,
    user
  }
}

// Calculate assignment score
const calculateAssignmentScore = async (lead: any, user: any, rule: any): Promise<number> => {
  let score = 0

  // Skill match score
  if (rule.assignment.skillRequirements && user.skills) {
    const matchingSkills = rule.assignment.skillRequirements.filter(skill => 
      user.skills.includes(skill)
    )
    score += (matchingSkills.length / rule.assignment.skillRequirements.length) * 40
  }

  // Region match score
  if (lead.region && user.region === lead.region) {
    score += 30
  }

  // Source match score
  if (lead.source && user.preferredSources?.includes(lead.source)) {
    score += 20
  }

  // Availability score
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))

  const todayAssignments = await LeadAssignment.countDocuments({
    assignedTo: user._id,
    assignedAt: { $gte: startOfDay, $lte: endOfDay },
    status: 'active'
  })

  const maxDaily = rule.assignment.maxLeadsPerDay || 10
  score += Math.max(0, (maxDaily - todayAssignments) / maxDaily) * 10

  return Math.min(100, score)
}

// Manual assignment
export const manualAssignLead = async (leadId: string, userId: string, assignedBy: string, notes?: string) => {
  try {
    await connectDB()

    // Check if user exists and is active
    const user = await User.findById(userId)
    if (!user || user.status !== 'active') {
      throw new Error('User not found or inactive')
    }

    // Check if lead exists
    const lead = await Lead.findById(leadId)
    if (!lead) {
      throw new Error('Lead not found')
    }

    // Create assignment record
    const assignment = new LeadAssignment({
      leadId,
      assignedTo: userId,
      assignedBy,
      assignmentType: 'manual',
      status: 'active',
      notes
    })

    await assignment.save()

    // Update lead
    await Lead.findByIdAndUpdate(leadId, { 
      assignedTo: userId,
      status: 'assigned'
    })

    return {
      success: true,
      assignment,
      user
    }
  } catch (error) {
    console.error('Error in manual assignment:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Transfer assignment
export const transferAssignment = async (assignmentId: string, newUserId: string, transferredBy: string, reason?: string) => {
  try {
    await connectDB()

    // Find the assignment
    const assignment = await LeadAssignment.findById(assignmentId)
    if (!assignment) {
      throw new Error('Assignment not found')
    }

    // Check if new user exists
    const newUser = await User.findById(newUserId)
    if (!newUser || newUser.status !== 'active') {
      throw new Error('New user not found or inactive')
    }

    // Update assignment
    assignment.status = 'transferred'
    assignment.transferredTo = newUserId
    assignment.transferredAt = new Date()
    assignment.transferredBy = transferredBy
    assignment.notes = reason

    await assignment.save()

    // Create new assignment record
    const newAssignment = new LeadAssignment({
      leadId: assignment.leadId,
      assignedTo: newUserId,
      assignedBy: transferredBy,
      assignmentType: 'manual',
      status: 'active',
      notes: `Transferred from ${assignment.assignedTo}. Reason: ${reason || 'No reason provided'}`
    })

    await newAssignment.save()

    // Update lead
    await Lead.findByIdAndUpdate(assignment.leadId, { 
      assignedTo: newUserId
    })

    return {
      success: true,
      oldAssignment: assignment,
      newAssignment,
      newUser
    }
  } catch (error) {
    console.error('Error in assignment transfer:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
