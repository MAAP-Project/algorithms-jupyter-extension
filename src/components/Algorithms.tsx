import React, { useMemo } from 'react';
import { IAlgorithm } from '../types/index';
import {
    useTable,
    useGlobalFilter,
    usePagination,
    useFilters
} from 'react-table';
import {
    Pagination, Table
} from 'react-bootstrap';

function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter, columns },
}) {

    return (
        <input
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
            }}
            placeholder={`Search...`}
        />
    )
}


function ReactTable({ columns, data }) {

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )

    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        canPreviousPage,
        canNextPage,
        prepareRow,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        state: { pageIndex }
    } = useTable({
        defaultColumn,
        columns,
        data,
        initialState: { pageIndex: 0 }
    }, useFilters, usePagination)

    // Render the UI for your table
    return (<>
        <Table {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}<div>{column.canFilter ? column.render('Filter') : null}</div></th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </Table>

        <div className='pagination'>
            <span>Showing {pageOptions.length === 0 ? 0 : pageIndex + 1} of {pageOptions.length}</span>
            <Pagination>
                <Pagination.First onClick={() => gotoPage(0)} disabled={!canPreviousPage} />
                <Pagination.Prev onClick={() => previousPage()} disabled={!canPreviousPage} />
                <Pagination.Next onClick={() => nextPage()} disabled={!canNextPage} />
                <Pagination.Last onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} />
            </Pagination>
        </div>
    </>
    )
}

export const Algorithms = () => {

    const algoInfo: IAlgorithm[] = [
        {
            algorithm_name: "algorithm1",
            description: "this is algo 1",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },
        {
            algorithm_name: "algorithm2",
            description: "this is algo 2",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },
        {
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },
        {
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        },{
            algorithm_name: "algorithm3",
            description: "this is algo 3",
            repository_url: "https://google.com",
            time_last_update: new Date().getUTCDate(),
            creator: "mlucas"
        }
    ]

    const data = useMemo(() => algoInfo, [algoInfo])
    const columns = useMemo(
        () => [
            {
                Header: 'Algorithm Name',
                accessor: 'algorithm_name' as const,
            },
            {
                Header: 'Creator',
                accessor: 'creator' as const,
            },
            {
                Header: 'Description',
                accessor: 'description' as const,
            },
            {
                Header: 'Last Updated',
                accessor: 'time_last_update' as const,
            }
        ],

        []
    )

    return (
        <ReactTable columns={columns} data={data} />
    )
}

