import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@nextui-org/react';
import React, { useState } from 'react';
import RenderDate from '../utils';
import moment from 'moment';

const Logs = () => {
  const [data, setData] = useState([
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589731
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589732
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589733
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589734
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589735
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589736
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731089589737
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1701589589738
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1531589589739
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589740
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589741
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589742
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589743
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589444
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589745
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589746
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589747
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589748
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589749
    },
    {
      from: 'asdfasdfaasdfasdf',
      to: 'asdfasdfa;sldfklksdlfka',
      amount: 0.0121551,
      time: 1731589589750
    },
  ]);


  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  const [pages, setPages] = useState(10);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end);
  }, [page, data]);


  return (
    <div>
      <Table aria-label="logs table"
        color='secondary'
        align='center'


        bottomContent={
          <div className="flex w-full justify-end">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              size='sm'
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}>
        <TableHeader>
          <TableColumn key='from' >From</TableColumn>
          <TableColumn key='to'  >To</TableColumn>
          <TableColumn key='amount'  >Amount</TableColumn>
          <TableColumn key='time' >Age</TableColumn>
        </TableHeader>
        <TableBody items={items} >
          {(item) => (
            <TableRow key={item.time}>
              {(columnKey) => <TableCell> {columnKey === 'time' ?
                <Tooltip showArrow={true} color='secondary' content={RenderDate(getKeyValue(item, columnKey))}>
                  {moment(getKeyValue(item, columnKey)).fromNow()}
                </Tooltip> :
                getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Logs;