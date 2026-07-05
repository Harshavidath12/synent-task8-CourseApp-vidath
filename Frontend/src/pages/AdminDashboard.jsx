import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Video, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '', thumbnail: '' });
  
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(null); // courseId
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [showLessonForm, setShowLessonForm] = useState(null); // moduleId
  const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', content: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchCourses();
  }, [user, navigate]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      // For each course, fetch its full details (modules and lessons)
      const fullCourses = await Promise.all(data.map(async (course) => {
        const details = await api.get(`/courses/${course._id}`);
        return details.data;
      }));
      setCourses(fullCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setNewCourse({ title: '', description: '', price: '', thumbnail: '' });
      setShowCourseForm(false);
      fetchCourses();
    } catch (error) {
      alert("Error creating course");
    }
  };

  const handleCreateModule = async (e, courseId) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${courseId}/modules`, { title: newModuleTitle });
      setNewModuleTitle('');
      setShowModuleForm(null);
      fetchCourses();
    } catch (error) {
      alert("Error creating module");
    }
  };

  const handleCreateLesson = async (e, moduleId) => {
    e.preventDefault();
    try {
      await api.post(`/courses/modules/${moduleId}/lessons`, newLesson);
      setNewLesson({ title: '', videoUrl: '', content: '' });
      setShowLessonForm(null);
      fetchCourses();
    } catch (error) {
      alert("Error creating lesson");
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button 
          onClick={() => setShowCourseForm(!showCourseForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover transition"
        >
          <Plus className="w-5 h-5" /> Create Course
        </button>
      </div>

      {showCourseForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-4">New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full border rounded p-2" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input required type="number" className="w-full border rounded p-2" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
              <input type="text" className="w-full border rounded p-2" value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required className="w-full border rounded p-2 h-24" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})}></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCourseForm(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover">Save Course</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {courses.map(({ course, modules }) => (
          <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-5 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setActiveCourseId(activeCourseId === course._id ? null : course._id)}
            >
              <div className="flex items-center gap-4">
                {activeCourseId === course._id ? <ChevronDown /> : <ChevronRight />}
                <div>
                  <h3 className="font-bold text-lg">{course.title}</h3>
                  <p className="text-sm text-gray-500">${course.price} • {modules.length} Modules</p>
                </div>
              </div>
            </div>

            {activeCourseId === course._id && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-700">Curriculum</h4>
                  <button 
                    onClick={() => setShowModuleForm(course._id)}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Module
                  </button>
                </div>

                {showModuleForm === course._id && (
                  <form onSubmit={(e) => handleCreateModule(e, course._id)} className="mb-6 bg-gray-50 p-4 rounded border flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Module Title</label>
                      <input required type="text" className="w-full border rounded p-2 text-sm" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="e.g. Introduction to React" />
                    </div>
                    <button type="button" onClick={() => setShowModuleForm(null)} className="px-3 py-2 text-sm border rounded hover:bg-gray-100">Cancel</button>
                    <button type="submit" className="bg-primary text-white px-3 py-2 text-sm rounded hover:bg-primary-hover">Save</button>
                  </form>
                )}

                <div className="space-y-4">
                  {modules.map((mod, mIdx) => (
                    <div key={mod._id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
                        <span className="font-semibold text-sm">Module {mIdx + 1}: {mod.title}</span>
                        <button 
                          onClick={() => setShowLessonForm(mod._id)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Lesson
                        </button>
                      </div>
                      
                      {showLessonForm === mod._id && (
                        <form onSubmit={(e) => handleCreateLesson(e, mod._id)} className="p-4 bg-gray-50 border-b space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Lesson Title</label>
                            <input required type="text" className="w-full border rounded p-2 text-sm" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">YouTube URL</label>
                            <input type="text" className="w-full border rounded p-2 text-sm" value={newLesson.videoUrl} onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Content (Markdown/Text)</label>
                            <textarea className="w-full border rounded p-2 text-sm h-20" value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})}></textarea>
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setShowLessonForm(null)} className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100">Cancel</button>
                            <button type="submit" className="bg-primary text-white px-3 py-1.5 text-xs rounded hover:bg-primary-hover">Save Lesson</button>
                          </div>
                        </form>
                      )}

                      <div className="divide-y text-sm">
                        {mod.lessons.map((lesson, lIdx) => (
                          <div key={lesson._id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              {lesson.videoUrl ? <Video className="w-4 h-4 text-gray-400" /> : <FileText className="w-4 h-4 text-gray-400" />}
                              <span>{lIdx + 1}. {lesson.title}</span>
                            </div>
                          </div>
                        ))}
                        {mod.lessons.length === 0 && <div className="p-3 text-gray-500 italic text-xs">No lessons added yet.</div>}
                      </div>
                    </div>
                  ))}
                  {modules.length === 0 && <div className="text-sm text-gray-500 italic py-2">No modules found. Create one above.</div>}
                </div>
              </div>
            )}
          </div>
        ))}
        {courses.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
            No courses found. Create your first course to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
