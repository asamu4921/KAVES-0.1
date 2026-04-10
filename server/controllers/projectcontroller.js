import Project from "../models/projectmodel.js";

// SAVE (create / update)
export const saveProject = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { ruangkerja_id } = req.query; // Ambil dari query string
    const projectData = req.body;

    if (!ruangkerja_id) {
      return res.status(400).json({ success: false, message: "ruangkerja_id wajib diisi" });
    }

    let existing = await Project.findOne({
      userId,
      ruangkerja_id,
      projectId: projectData.id,
    });

    if (existing) {
      existing.data = projectData;
      existing.name = projectData.name;
      existing.ruangkerja_id = ruangkerja_id;
      await existing.save();
    } else {
      await Project.create({
        userId,
        ruangkerja_id,
        projectId: projectData.id,
        name: projectData.name,
        data: projectData,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// GET ALL (Filter berdasarkan ruangkerja_id)
export const getProjects = async (req, res) => {
  const userId = req.user?.id;
  const { ruangkerja_id } = req.query;

  if (!ruangkerja_id) {
    return res.status(400).json({ success: false, message: "ruangkerja_id wajib diisi" });
  }

  const projects = await Project.find({ userId, ruangkerja_id }).sort({ updatedAt: -1 });

  res.json(
    projects.map(p => ({
      id: p.projectId,
      name: p.name,
      updatedAt: p.updatedAt,
    }))
  );
};
// GET ONE
export const getProjectById = async (req, res) => {
  const userId = req.user?.id;
  const { ruangkerja_id } = req.query;
  const { id } = req.params;

  if (!ruangkerja_id) {
    return res.status(400).json({ success: false, message: "ruangkerja_id wajib diisi" });
  }

  const project = await Project.findOne({ userId, ruangkerja_id, projectId: id });

  if (!project) return res.status(404).json(null);

  res.json(project.data);
};

// DELETE
export const deleteProject = async (req, res) => {
  const userId = req.user?.id;
  const { ruangkerja_id } = req.query;
  const { id } = req.params;

  if (!ruangkerja_id) {
    return res.status(400).json({ success: false, message: "ruangkerja_id wajib diisi" });
  }

  await Project.deleteOne({ userId, ruangkerja_id, projectId: id });

  res.json({ success: true });
};

// THUMBNAIL SAVE
export const saveThumbnail = async (req, res) => {
  const userId = req.user?.id;
  const { ruangkerja_id } = req.query;
  const { id } = req.params;
  const { dataUrl } = req.body;

  if (!ruangkerja_id) {
    return res.status(400).json({ success: false, message: "ruangkerja_id wajib diisi" });
  }

  await Project.findOneAndUpdate(
    { userId, ruangkerja_id, projectId: id },
    { thumbnail: dataUrl }
  );

  res.json({ success: true });
};

// THUMBNAIL GET
export const getThumbnail = async (req, res) => {
  const userId = req.user?.id;
  const { ruangkerja_id } = req.query;
  const { id } = req.params;

  if (!ruangkerja_id) {
    return res.status(400).json({ success: false, message: "ruangkerja_id wajib diisi" });
  }

  const project = await Project.findOne({ userId, ruangkerja_id, projectId: id });

  if (!project || !project.thumbnail) {
    return res.status(404).json(null);
  }

  res.json({ dataUrl: project.thumbnail });
};