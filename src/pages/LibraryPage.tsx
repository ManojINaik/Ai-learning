import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Clock } from 'lucide-react';
import { getResources } from '../services/firebase.service';
import type { Resource } from '../services/firebase.service';

const LibraryPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Library</h1>
        <p className="text-gray-600">Access our comprehensive collection of learning resources.</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold">{resource.title}</h2>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-4">Type: {resource.type}</span>
                <span>Level: {resource.level}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Duration: {resource.duration}</span>
              </div>
            </div>
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Start Learning
            </button>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;