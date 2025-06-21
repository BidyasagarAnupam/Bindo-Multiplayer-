import { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { serverURL } from '../../constants/config';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  User,
  Spinner,
  Chip,
} from "@heroui/react";

const GameHistory = () => {
  const [games, setGames] = useState([]);  // Stores game history
  const [page, setPage] = useState(0);     // Page number
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const tableContainerRef = useRef(null);  // Reference to the table container

  // Function to fetch game history from the API
  const fetchGames = async () => {
    if (loading || !hasMore) return;  // Prevent multiple API calls

    setLoading(true);
    try {
      const response = await axios.get(`${serverURL}/api/v1/game/get-gameHistory?page=${page}&limit=10`,
        { withCredentials: true }
      );
      const newGames = response?.data?.formattedGames;

      // Append new games to the list
      setGames(prevGames => [...prevGames, ...newGames]);

      // If received games are less than limit, it means no more games to fetch
      setHasMore(response?.data?.hasMore);
      console.log("Games", newGames);
    } catch (error) {
      console.error("Error fetching game history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch games when page changes
  useEffect(() => {
    fetchGames();
  }, [page]);

  // Function to handle scroll event inside the table container
  const handleScroll = () => {
    if (!tableContainerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;

    // Check if user has scrolled to the bottom
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      setPage(prevPage => prevPage + 1);  // Increase page number to fetch more data
    }
  };

  // Attach scroll event listener
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasMore]);

  const columns = [
    { key: "serialNo", label: "Serial No." },
    { key: "opponent", label: "Opponent" },
    { key: "status", label: "Status" },
    { key: "timeTaken", label: "Time to Complete" }
  ];

  return (
    <div className='pb-6'>
      <h2 className='text-3xl md:text-5xl font-semibold opacity-70 mb-6'>Game History</h2>

      {/* Table Container with Scrollable Area */}
      <div
        ref={tableContainerRef}
        className="max-h-[500px] overflow-y-auto"
      >
        <Table
          aria-label="Game History"
          isStriped
          classNames={{
            base: "w-full",
            table: "max-h-[800px]",
          }}
          bottomContent={
            loading &&
            <div className="flex w-full justify-center">
              <Spinner
                size='lg' />
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key} className='p-3 text-lg text-center'>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody
            items={games}
            emptyContent={"No rows to display."}
          >
            {(item) => (
              <TableRow key={item._id}>
                {(columnKey) => (
                  <TableCell className='text-center'>
                    {columnKey === "serialNo" ? games.findIndex(element => element === item) + 1 :
                      columnKey === "opponent" ? (
                        <User
                          avatarProps={{ src: `${item?.players?.profileDetails?.avatar}` }}
                          name={`@${item?.players?.userName}`}
                        />
                      ) :
                        columnKey === "status" ? 
                          <Chip
                            variant='faded'
                            color={`${item.isWinner ? "success" : "danger"}`}
                          >
                            {
                              `${item.isWinner ?
                                "Winner 🥳" : "Loser 😢"}`
                            }
                          </Chip>
                          :
                          getKeyValue(item, columnKey)
                    }
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GameHistory;
