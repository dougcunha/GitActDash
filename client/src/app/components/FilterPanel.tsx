"use client";
import SortControls from './SortControls';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner?: {
    login: string;
    type: 'User' | 'Organization';
  };
  updated_at: string;
}

interface Props {
  repos: Repo[];
  selectedRepos: number[];
  onRepoToggle: (id: number) => void;
  repoFilter: 'all' | 'personal' | 'organization';
  setRepoFilter: (val: 'all' | 'personal' | 'organization') => void;
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
  repoFilter,
  setRepoFilter,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  sortBy,
  setSortBy,
}: Props) {
  const filteredRepos = repos
    .filter(repo => {
      const typeFilter =
        repoFilter === 'all' ||
        (repoFilter === 'personal' && repo.owner?.type === 'User') ||
        (repoFilter === 'organization' && repo.owner?.type === 'Organization');
      const searchFilter =
        searchTerm === '' ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.owner?.login && repo.owner.login.toLowerCase().includes(searchTerm.toLowerCase()));
      return typeFilter && searchFilter;
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
    <div className="w-80 max-w-full h-full overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Repositories</h2>

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

      <SortControls
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        showSortBySelector={true}
        label="Sort by:"
        size="sm"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setRepoFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            repoFilter === 'all'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All ({repos.length})
        </button>
        <button
          onClick={() => setRepoFilter('personal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            repoFilter === 'personal'
              ? 'bg-green-600 dark:bg-green-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Personal ({repos.filter(r => r.owner?.type === 'User').length})
        </button>
        <button
          onClick={() => setRepoFilter('organization')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
            repoFilter === 'organization'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Organizations ({repos.filter(r => r.owner?.type === 'Organization').length})
        </button>
      </div>

      {(searchTerm || repoFilter !== 'all') && (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Showing {filteredRepos.length} of {repos.length} repositories
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {filteredRepos.length > 0 ? (
          filteredRepos.map(repo => (
            <div
              key={repo.id}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800 ${
                selectedRepos.includes(repo.id)
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
              }`}
              onClick={() => onRepoToggle(repo.id)}
            >
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
