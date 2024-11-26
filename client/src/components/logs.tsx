import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import RenderDate from '../utils';
import moment from 'moment';
import { useSocket } from '../utils/use-socket';
import { postService } from '../utils/request';
import RenderLongString from './RenderLongString';
import { explorerUrl } from '../contexts/RpcContext';

interface Log {
  name: string;
  amount: string;
  from: string;
  to: string;
  hash: string;
  time: string;
}


const Logs = () => {

  const [data, setData] = useState<Log[]>([]);
  const { socket } = useSocket();
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  const [pages, setPages] = useState(1);
  const handleTransaction = (res: Log) => {
    data.pop();
    setData([res, ...data]);
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_transaction', handleTransaction);
      return () => {
        socket.off('new_transaction');
      };
    }
  }, [socket, data]);

  useEffect(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage - 1;
    console.log({ start, end });

    postService('/logs', { start, end }).then(({ data: _data }) => {
      console.log(_data);
      setData(_data.data);
      setPages(Math.ceil(_data.total / rowsPerPage));
    });

  }, [page]);


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
          <TableColumn key='hash' >Hash</TableColumn>
          <TableColumn key='from' >From</TableColumn>
          <TableColumn key='to'  >To</TableColumn>
          <TableColumn key='name' >Name</TableColumn>
          <TableColumn key='amount' >Amount</TableColumn>
          <TableColumn key='time' >Age</TableColumn>
        </TableHeader>
        <TableBody items={data} >
          {(item) => (
            <TableRow key={item.time}>
              {(columnKey) => <TableCell> {columnKey === 'time' ?
                <Tooltip showArrow={true} color='secondary' content={RenderDate(getKeyValue(item, columnKey))}>
                  {moment(getKeyValue(item, columnKey)).fromNow()}
                </Tooltip> : <RenderLongString link={columnKey === 'hash' ? explorerUrl : ''}  >
                  {getKeyValue(item, columnKey)}
                </RenderLongString>
              }</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Logs;