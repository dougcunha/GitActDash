"use client";
import { useState } from 'react';
import Image from 'next/image';
import SortControls from './SortControls';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner?: {
    login: string;
    type: 'User' | 'Organization';
    avatar_url?: string;
  };
  updated_at: string;
  description?: string;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  archived?: boolean;
  pushed_at?: string;
  topics?: string[];
}

interface Props {
  repos: Repo[];
  selectedRepos: number[];
  onRepoToggle: (id: number) => void;
  ownerFilter: 'all' | 'personal' | string;
  setOwnerFilter: (val: 'all' | 'personal' | string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (val: 'asc' | 'desc') => void;
  sortBy: 'name' | 'full_name' | 'updated_at';
  setSortBy: (val: 'name' | 'full_name' | 'updated_at') => void;
}

export default function FilterPanel({
  repos,
  selectedRepos,
  onRepoToggle,
  ownerFilter,
  setOwnerFilter,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  sortBy,
  setSortBy,
}: Props) {
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };
  
  const organizationNames = Array.from(
    new Set(
      repos
        .filter(r => r.owner?.type === 'Organization')
        .map(r => r.owner!.login)
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredRepos = repos
    .filter(repo => {
      const ownerMatch =
        ownerFilter === 'all' ||
        (ownerFilter === 'personal' && repo.owner?.type === 'User') ||
        (repo.owner?.type === 'Organization' && repo.owner?.login === ownerFilter);
      const searchFilter =
        searchTerm === '' ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.owner?.login && repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return ownerMatch && searchFilter;
    })
    .sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          break;
        case 'full_name':
          compareValue = a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase());
          break;
        case 'updated_at':
          compareValue = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        default:
          compareValue = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  return (
    <div className={`${viewMode === 'detailed' ? 'w-96' : 'w-80'} max-w-full h-full overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Repositories</h2>
        
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('simple')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'simple'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Simple view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'detailed'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Detailed view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <SortControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          showSortBySelector={true}
          label="Sort by:"
          size="md"
        />

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value as 'all' | 'personal' | string)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600"
        >
          <option value="all">All owners ({repos.length})</option>
          <option value="personal">Personal ({repos.filter(r => r.owner?.type === 'User').length})</option>
          {organizationNames.map((name) => (
            <option key={name} value={name}>
              {name} ({repos.filter(r => r.owner?.login === name).length})
            </option>
          ))}
        </select>
      </div>

      {(searchTerm || ownerFilter !== 'all') && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Showing {filteredRepos.length} of {repos.length} repositories
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      <div className="grid gap-2 grid-cols-1">
        {filteredRepos.length > 0 ? (
          filteredRepos.map(repo => (
            <div
              key={repo.id}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800 ${
                selectedRepos.includes(repo.id)
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
              } ${viewMode === 'detailed' ? 'p-4' : 'p-3'}`}
              onClick={() => onRepoToggle(repo.id)}
            >
              {viewMode === 'simple' ? (
                // Simple Mode (Current)
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded mr-3"
                    checked={selectedRepos.includes(repo.id)}
                    readOnly
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{repo.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{repo.full_name}</p>
                    <div className="flex gap-1 mt-1">
                      {repo.private && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">Private</span>
                      )}
                      {repo.owner?.type === 'Organization' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Organization</span>
                      )}
                      {repo.owner?.type === 'User' && repo.owner?.login !== repo.full_name.split('/')[0] && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">Personal</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Detailed Mode (New)
                <div className="space-y-3">
                  {/* Header with checkbox and avatar */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded mt-1 flex-shrink-0"
                      checked={selectedRepos.includes(repo.id)}
                      readOnly
                    />
                    {repo.owner?.avatar_url && (
                      <Image
                        src={repo.owner.avatar_url}
                        alt={repo.owner.login}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm break-words">{repo.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 break-words">{repo.full_name}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {repo.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 break-words leading-relaxed">{repo.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {repo.language && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>{repo.language}</span>
                      </div>
                    )}
                    {typeof repo.stargazers_count === 'number' && repo.stargazers_count > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{repo.stargazers_count}</span>
                      </div>
                    )}
                    {typeof repo.forks_count === 'number' && repo.forks_count > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{repo.forks_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags and Last Activity */}
                  <div className="space-y-2">
                    {/* Topics */}
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <span key={topic} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {topic}
                          </span>
                        ))}
                        {repo.topics.length > 3 && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">+{repo.topics.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Status badges and last activity */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {repo.private && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">Private</span>
                        )}
                        {repo.archived && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Archived</span>
                        )}
                        {repo.owner?.type === 'Organization' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Org</span>
                        )}
                      </div>
                      
                      {repo.pushed_at && (
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            Updated {formatRelativeTime(repo.pushed_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-sm text-gray-500 dark:text-gray-400">No repositories found</div>
        )}
      </div>

      {selectedRepos.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-800 dark:text-green-200">
          {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : ''} selected
        </div>
      )}
    </div>
  );
}
