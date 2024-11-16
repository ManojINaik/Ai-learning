import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { getResources, addResource, updateResource, deleteResource } from '../../services/firebase.service';
import type { Resource } from '../../services/firebase.service';

interface ResourceFormData {
  title: string;
  type: string;
  level: string;
  duration: string;
}

const initialFormData: ResourceFormData = {
  title: '',
  type: 'course',
  level: 'beginner',
  duration: '1 hour'
};

const AdminContent = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getResources((data) => {
      setResources(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingResource) {
        await updateResource(editingResource.id, formData);
        setSuccess('Resource updated successfully');
      } else {
        await addResource(formData);
        setSuccess('Resource added successfully');
      }
      setFormData(initialFormData);
      setIsAddModalOpen(false);
      setEditingResource(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save resource');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      setError(null);
      setSuccess(null);

      try {
        await deleteResource(id);
        setSuccess('Resource deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Failed to delete resource');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const ResourceModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h3>
          <button
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingResource(null);
              setFormData(initialFormData);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleAddResource} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="course">Course</option>
              <option value="tutorial">Tutorial</option>
              <option value="workshop">Workshop</option>
              <option value="article">Article</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 2 hours"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {editingResource ? 'Update Resource' : 'Add Resource'}
          </button>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage learning resources and materials</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{resource.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingResource(resource);
                    setFormData(resource);
                    setIsAddModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteResource(resource.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {resource.type}</p>
              <p>Level: {resource.level}</p>
              <p>Duration: {resource.duration}</p>
              {resource.createdAt && (
                <p>Added: {resource.createdAt.toLocaleDateString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && <ResourceModal />}
    </div>
  );
};

export default AdminContent;