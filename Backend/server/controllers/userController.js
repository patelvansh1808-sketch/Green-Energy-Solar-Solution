const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find({ 
      role: { $in: ['engineer', 'sales', 'support'] } 
    }).select('-password');
    
    // Ensure firstName and lastName are populated from name if needed
    const formattedMembers = teamMembers.map(member => {
      const memberObj = member.toObject();
      
      // If firstName/lastName don't exist, split from name
      if (!memberObj.firstName || !memberObj.lastName) {
        const nameParts = (memberObj.name || '').split(' ');
        memberObj.firstName = memberObj.firstName || nameParts[0] || '';
        memberObj.lastName = memberObj.lastName || nameParts.slice(1).join(' ') || '';
      }
      
      return memberObj;
    });
    
    // Silence noisy debug logging in production
    
    res.json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching team members" 
    });
  }
};
