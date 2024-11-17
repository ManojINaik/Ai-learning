import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';

interface Domain {
  id: string;
  name: string;
  description: string;
}

export const AssessmentManagement: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState({ name: '', description: '' });
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const domainsCollection = collection(db, 'domains');
      const domainsSnapshot = await getDocs(domainsCollection);
      const domainsList = domainsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Domain));
      setDomains(domainsList);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const domainsCollection = collection(db, 'domains');
      await addDoc(domainsCollection, {
        name: newDomain.name,
        description: newDomain.description
      });
      setNewDomain({ name: '', description: '' });
      fetchDomains();
    } catch (error) {
      console.error('Error adding domain:', error);
    }
  };

  const handleEditDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomain) return;

    try {
      const domainRef = doc(db, 'domains', editingDomain.id);
      await updateDoc(domainRef, {
        name: editingDomain.name,
        description: editingDomain.description
      });
      setIsEditing(false);
      setEditingDomain(null);
      fetchDomains();
    } catch (error) {
      console.error('Error updating domain:', error);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      try {
        const domainRef = doc(db, 'domains', domainId);
        await deleteDoc(domainRef);
        fetchDomains();
      } catch (error) {
        console.error('Error deleting domain:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Assessment Domain Management</h2>
      
      {/* Add/Edit Domain Form */}
      <form onSubmit={isEditing ? handleEditDomain : handleAddDomain} className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? 'Edit Domain' : 'Add New Domain'}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Domain Name</label>
            <input
              type="text"
              value={isEditing ? editingDomain?.name : newDomain.name}
              onChange={(e) => isEditing 
                ? setEditingDomain(prev => prev ? { ...prev, name: e.target.value } : null)
                : setNewDomain(prev => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={isEditing ? editingDomain?.description : newDomain.description}
              onChange={(e) => isEditing
                ? setEditingDomain(prev => prev ? { ...prev, description: e.target.value } : null)
                : setNewDomain(prev => ({ ...prev, description: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingDomain(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {isEditing ? 'Update Domain' : 'Add Domain'}
            </button>
          </div>
        </div>
      </form>

      {/* Domains List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domains.map((domain) => (
              <tr key={domain.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{domain.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{domain.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingDomain(domain);
                      setIsEditing(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
