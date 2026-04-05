import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import Footer from './components/Footer'; // adjust path if needed

interface Project {
  id: string;
  project_name: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    };

    fetchProjects();
  }, []);

  const handleUploadToProject = async () => {
    if (!file || !selectedProjectId) return;

    const filePath = `${selectedProjectId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      console.error('User error:', userError?.message);
      return;
    }

    await supabase.from('files').insert({
      project_id: selectedProjectId,
      file_name: file.name,
      file_path: filePath,
      uploaded_by: user.id,
    });

    setFile(null);
    setShowUpload(false);
    setToastMessage('✅ Upload successful!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user) return;
    const { error } = await supabase
      .from('projects')
      .insert([{ project_name: newProjectName, user_id: user.id }]);
    if (error) {
      setToastMessage('❌ Error creating project');
    } else {
      setToastMessage('✅ Project created!');
      setNewProjectName('');
      setShowNewProject(false);
      // Refresh projects
      const { data } = await supabase
        .from('projects')
        .select('*');
      setProjects(data || []);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <header className="header">
        <div className="logo">VENSHARES</div>
        <nav className="nav">
          <Link to="/" className="nav-btn">HOME</Link>
            <Link to="/contact" className="nav-btn">CONTACT US</Link>
          <Link to="/login" className="nav-btn">LOGIN/JOIN</Link>
        </nav>
      </header>
      <div className="login-banner-bg" />
      <div className="p-6">
        {user && (
          <div className="mb-4 text-lg font-semibold">
            Welcome, {user.email}
          </div>
        )}

        {/* Create New Project Button and Form */}
        <div className="mb-6 flex items-center gap-4">
          <button
            className="bg-lime-600 text-white px-4 py-2 rounded font-semibold hover:bg-lime-700"
            onClick={() => setShowNewProject((v) => !v)}
          >
            + Create New Project
          </button>
          {showNewProject && (
            <form onSubmit={handleCreateProject} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Project Name"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                className="text-gray-500 px-2 py-1"
                onClick={() => {
                  setShowNewProject(false);
                  setNewProjectName('');
                }}
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">My Projects</h1>



        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 border rounded shadow hover:bg-gray-50 transition"
              >
                <div className="font-semibold text-lg mb-1">{project.project_name}</div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    View Files
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowUpload(true);
                    }}
                    className="px-3 py-1 bg-lime-600 text-white text-sm rounded hover:bg-lime-700"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && selectedProjectId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Upload File to Project</h3>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleUploadToProject}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Upload
                </button>
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setFile(null);
                  }}
                  className="text-gray-500 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition">
            {toastMessage}
          </div>
        )}
      </div>

      <Footer />

    </>
  );
}