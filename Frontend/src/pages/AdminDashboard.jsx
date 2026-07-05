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
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your courses, modules, and lessons.</p>
        </div>
        <button 
          onClick={() => setShowCourseForm(!showCourseForm)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary-hover hover:-translate-y-0.5 transition-all shadow-md font-medium"
        >
          <Plus className="w-5 h-5" /> {showCourseForm ? 'Cancel Creation' : 'Create Course'}
        </button>
      </div>

      {showCourseForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-10 transform transition-all">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-2 rounded-lg"><Plus className="w-6 h-6"/></span>
            New Course
          </h2>
          <form onSubmit={handleCreateCourse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Title</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} placeholder="e.g. Master React in 30 Days" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Price ($)</label>
                <input required type="number" step="0.01" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} placeholder="49.99" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Thumbnail URL</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm" value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} placeholder="https://images.unsplash.com/photo-..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">Description</label>
              <textarea required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm h-32 resize-none" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} placeholder="Describe what students will learn..."></textarea>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowCourseForm(false)} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-xl font-medium hover:bg-primary-hover shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Save Course</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {courses.map(({ course, modules }) => (
          <div key={course._id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div 
              className="p-6 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center cursor-pointer transition-colors border-b border-gray-100"
              onClick={() => setActiveCourseId(activeCourseId === course._id ? null : course._id)}
            >
              <div className="flex items-center gap-5">
                <div className={`p-2 rounded-full transition-transform duration-300 ${activeCourseId === course._id ? 'bg-primary/10 text-primary rotate-90' : 'bg-gray-100 text-gray-500'}`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{course.title}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">${course.price}</span> 
                    <span>•</span>
                    <span>{modules.length} Modules</span>
                  </p>
                </div>
              </div>
            </div>

            {activeCourseId === course._id && (
              <div className="p-8 bg-white">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-extrabold text-2xl text-gray-800 tracking-tight">Curriculum</h4>
                  <button 
                    onClick={() => setShowModuleForm(course._id)}
                    className="text-sm bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Module
                  </button>
                </div>

                {showModuleForm === course._id && (
                  <form onSubmit={(e) => handleCreateModule(e, course._id)} className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-end shadow-inner">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Module Title</label>
                      <input required type="text" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm transition-all" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="e.g. Introduction to React" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button type="button" onClick={() => setShowModuleForm(null)} className="flex-1 md:flex-none px-5 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                      <button type="submit" className="flex-1 md:flex-none bg-primary text-white px-6 py-3 text-sm font-medium rounded-xl hover:bg-primary-hover shadow-md transition-colors">Save</button>
                    </div>
                  </form>
                )}

                <div className="space-y-6">
                  {modules.map((mod, mIdx) => (
                    <div key={mod._id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-gray-50 p-5 flex justify-between items-center border-b border-gray-200">
                        <span className="font-bold text-gray-800 flex items-center gap-3">
                          <span className="bg-gray-200 text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg text-sm">{mIdx + 1}</span>
                          {mod.title}
                        </span>
                        <button 
                          onClick={() => setShowLessonForm(mod._id)}
                          className="text-sm font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Lesson
                        </button>
                      </div>
                      
                      {showLessonForm === mod._id && (
                        <form onSubmit={(e) => handleCreateLesson(e, mod._id)} className="p-6 bg-indigo-50/30 border-b border-gray-200 space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Lesson Title</label>
                            <input required type="text" className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm transition-all" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} placeholder="e.g. Understanding JSX" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Video className="h-5 w-5 text-gray-400" />
                              </div>
                              <input type="text" className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm transition-all" value={newLesson.videoUrl} onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Content Details</label>
                            <textarea className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm transition-all h-24 resize-none" value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})} placeholder="Add supplementary text or markdown here..."></textarea>
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowLessonForm(null)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                            <button type="submit" className="bg-primary text-white px-6 py-2.5 text-sm font-medium rounded-xl hover:bg-primary-hover shadow-md hover:shadow-lg transition-all">Save Lesson</button>
                          </div>
                        </form>
                      )}

                      <div className="divide-y divide-gray-100">
                        {mod.lessons.map((lesson, lIdx) => (
                          <div key={lesson._id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {lesson.videoUrl ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <span className="font-medium text-gray-700 group-hover:text-gray-900">{lIdx + 1}. {lesson.title}</span>
                            </div>
                          </div>
                        ))}
                        {mod.lessons.length === 0 && <div className="p-6 text-gray-400 text-center text-sm font-medium">No lessons added to this module yet.</div>}
                      </div>
                    </div>
                  ))}
                  {modules.length === 0 && (
                    <div className="text-center p-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">No modules found. Create your first module to start building the curriculum!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {courses.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">Get started by creating your first course. It will appear here once you hit save!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
