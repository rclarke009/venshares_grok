import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import Footer from './components/Footer'; // adjust path if needed

interface ProjectFile {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  created_at?: string;
  signedUrl?: string;
}

export default function ProjectPage() {
  const { id } = useParams();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');

  // Fetch files and generate signed URLs
  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', id);

    if (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } else {
      // For each file, get a signed URL
      const filesWithUrls = await Promise.all(
        (data || []).map(async (file: ProjectFile) => {
          const { data: urlData } = await supabase.storage
            .from('project-files')
            .createSignedUrl(file.file_path, 60 * 60); // 1 hour
          return {
            ...file,
            signedUrl: urlData?.signedUrl || '',
          };
        })
      );
      setFiles(filesWithUrls);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchFiles();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    const fetchProjectName = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('projects')
        .select('project_name')
        .eq('id', id)
        .single();
      if (!error && data) {
        setProjectName(data.project_name);
      }
    };
    fetchProjectName();
  }, [id]);

  const handleUpload = async () => {
    if (!file || !id) return;
    setUploading(true);

    const filePath = `${id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file);

    if (uploadError) {
      setToastMessage('❌ Upload error: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setToastMessage('❌ User not authenticated');
      setUploading(false);
      return;
    }

    // Insert file record into 'files' table
    const { error: insertError } = await supabase.from('files').insert({
      project_id: id,
      file_name: file.name,
      file_path: filePath,
      //file_type: file.type || 'other', // or a valid enum value
      uploaded_at: new Date().toISOString(),
      uploaded_by: userData.user.id,
    });

    if (insertError) {
      setToastMessage('❌ Error saving file info');
    } else {
      setToastMessage('✅ Upload successful!');
      setShowUpload(false);
      setFile(null);
      fetchFiles();
    }
    setUploading(false);
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
        <h1 className="text-2xl font-bold mb-2">{projectName || 'Project'}</h1>
        <p className="mb-4 text-gray-700 text-sm">Project ID: {id}</p>
        <div className="mb-4">
          <button
            className="bg-lime-600 text-white px-4 py-2 rounded font-semibold hover:bg-lime-700"
            onClick={() => setShowUpload(true)}
          >
            + Upload File
          </button>
        </div>
        {showUpload && (
          <div className="mb-6 border rounded p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Upload a file to this project</h3>
            <input
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={uploading || !file}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setFile(null);
                }}
                className="text-gray-500 px-4 py-2"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <h2 className="text-xl font-semibold mb-2">Files</h2>
        {loading ? (
          <p>Loading files…</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500">No files found for this project.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id} className="border rounded p-2 flex items-center justify-between">
                <span>{file.file_name}</span>
                <span className="flex gap-3">
                  <a
                    href={file.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    Preview
                  </a>
                  <a
                    href={file.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                    download
                  >
                    Download
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition">
            {toastMessage}
          </div>
        )}
        <Link to="/dashboard" className="text-blue-600 hover:underline mt-8 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
      <Footer />
    </>
  );
}