import React from 'react';
import { 
  useTable, 
  useSortBy, 
  usePagination, 
  Column, 
  Row, 
  TableInstance, 
  HeaderGroup
} from 'react-table';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (_row: Row<T>) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  keyField?: string;
}

// Define types for react-table with TypeScript
type SortingColumn = {
  getSortByToggleProps: () => any;
  isSorted: boolean;
  isSortedDesc: boolean;
};

type TableColumn<T extends object> = Column<T> & SortingColumn;

type TableHeaderGroup<T extends object> = HeaderGroup<T> & {
  headers: TableColumn<T>[];
};

// Extend TableInstance type to include pagination properties
type TableInstanceWithPagination<T extends object> = TableInstance<T> & {
  page: Row<T>[];
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageCount: number;
  gotoPage: (_page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  state: {
    pageIndex: number;
    pageSize: number;
  };
  headerGroups: TableHeaderGroup<T>[];
};

function Table<T extends object>({
  columns,
  data,
  pagination = true,
  pageSize = 10,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  keyField = 'id',
}: TableProps<T>) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: { 
        // @ts-ignore - pageIndex is valid but not in the type definition
        pageIndex: 0,
        pageSize: pageSize as number
      },
    },
    useSortBy,
    usePagination
  ) as TableInstanceWithPagination<T>;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <svg className="animate-spin h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="table-container">
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup, groupIndex) => (
            <tr {...headerGroup.getHeaderGroupProps({ key: `header-group-${groupIndex}` })}>
              {headerGroup.headers.map((column, columnIndex) => (
                <th
                  {...column.getHeaderProps({
                    key: `header-${columnIndex}`,
                    // @ts-ignore - getSortByToggleProps is valid but not in the type definition
                    ...(column.getSortByToggleProps && column.getSortByToggleProps())
                  })}
                  className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900"
                  scope="col"
                >
                  <div className="flex items-center">
                    {column.render('Header')}
                    <span>
                      {/* @ts-ignore - isSorted is valid but not in the type definition */}
                      {(column as any).isSorted ? (
                        (column as any).isSortedDesc ? (
                          <ChevronDownIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronUpIcon className="ml-1 h-4 w-4" />
                        )
                      ) : null}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white">
          {page.map(row => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps({
                  key: row.original[keyField as keyof typeof row.original] as string
                })}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {row.cells.map(cell => (
                  <td 
                    {...cell.getCellProps({
                      key: `${row.original[keyField as keyof typeof row.original]}-${cell.column.id}`
                    })} 
                    className="whitespace-nowrap py-4 px-4 text-sm text-gray-500"
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pagination && pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{pageIndex * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((pageIndex + 1) * pageSize, data.length)}
                </span>{' '}
                of <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                  const pageNum = i + Math.max(0, Math.min(pageIndex - 2, pageCount - 5));
                  return (
                    <button
                      key={pageNum}
                      onClick={() => gotoPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pageIndex
                          ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;