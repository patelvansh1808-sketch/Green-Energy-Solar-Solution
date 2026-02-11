const Installation = require("../models/Installation");
const User = require("../models/User");

// Create project
exports.createProject = async (req, res) => {
  try {
    const { customerId, leadId, surveyDate, surveyNotes } = req.body;
    const project = await Installation.create({
      customer: customerId,
      lead: leadId,
      siteSurvey: { scheduledDate: surveyDate, status: surveyDate ? "scheduled" : "pending", notes: surveyNotes },
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List projects
exports.listProjects = async (req, res) => {
  try {
    const projects = await Installation.find()
      .populate("customer")
      .populate("assignedEngineer")
      .lean();
    res.json(projects);
  } catch (err) {
    console.error("Error fetching installations:", err);
    res.status(500).json({ message: "Failed to fetch installations: " + err.message });
  }
};

// Get project by id
exports.getProject = async (req, res) => {
  try {
    const project = await Installation.findById(req.params.id)
      .populate("customer")
      .populate("assignedEngineer")
      .lean();
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch (err) {
    console.error("Error fetching installation:", err);
    res.status(500).json({ message: "Failed to fetch installation: " + err.message });
  }
};

// Assign engineer
exports.assignEngineer = async (req, res) => {
  try {
    const { engineerId } = req.body;
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== "engineer") {
      return res.status(400).json({ message: "Invalid engineer" });
    }
    const project = await Installation.findByIdAndUpdate(
      req.params.id,
      { assignedEngineer: engineerId, status: "engineer_assigned" },
      { new: true }
    ).populate("assignedEngineer");
    res.json({ message: "Engineer assigned", project });
  } catch (err) {
    console.error("Error assigning engineer:", err);
    res.status(500).json({ message: "Failed to assign engineer: " + err.message });
  }
};

// Update progress
exports.updateProgress = async (req, res) => {
  try {
    const { percent, note } = req.body;
    const project = await Installation.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });

    project.progress = Math.max(0, Math.min(100, Number(percent || project.progress)));
    project.status = project.progress >= 1 ? "install_in_progress" : project.status;
    project.progressLogs.push({ percent: project.progress, note, by: req.user?.id });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Commissioning
exports.markCommissioned = async (req, res) => {
  try {
    const { date, notes } = req.body;
    const project = await Installation.findByIdAndUpdate(
      req.params.id,
      { commissioning: { date: date || new Date(), status: "completed", notes }, status: "commissioning_done" },
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Go live
exports.markLive = async (req, res) => {
  try {
    const project = await Installation.findByIdAndUpdate(
      req.params.id,
      { goLive: { date: new Date(), confirmedBy: req.user?.id, status: "confirmed" }, status: "live" },
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
