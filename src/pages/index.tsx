import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Text,
  Grid,
} from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/color-mode";
import { InfoOutlineIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { use, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Spot } from "@/pages/spot";

const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function uniqueLetterCount(Spots: Spot[]): number {
  let newArray: String[] = ["a"];

  Spots.map((spot: Spot): void => {
    newArray.push(spot.id[0]);
  });
  let uniqueChars: String[] = [...new Set(newArray)];
  return uniqueChars.length;
}

export default function Home() {
  const [spinner, setSpinner] = useState(false);

  const initialSpot: Spot = {
    id: "",
    status: 0,
  };
  const url = "/api/parking";

  const [Spots, setSpots] = useState([initialSpot]);
  const { data, error } = useSWR(url, fetcher, { refreshInterval: 15000 });

  // remove initial state collision
  useEffect(() => {
    setSpots([]);
  }, []);
  useEffect(() => {
    //console.log(error)
    setSpinner(true);
    if (data) {
      data.map((item: Spot) => {
        if (item) {
          //console.log(item)
          Spots.push(item);
        }
      });
      setSpots([...Spots]);
      setSpinner(false);
    }
  }, [data, error]);
  let Incrementer: number = 0;
  let statusColor: string;
  let sectors = [...Array(Math.round(uniqueLetterCount(Spots) / 2)).keys()];
  const { colorMode, toggleColorMode } = useColorMode();

  /* <-- EDITABILITY FEATURE --> */
  const { data: sectorData, error: sectorError } = useSWR(
    "/api/sectorCoordinates",
    fetcher
  );

  useEffect(() => {
    if (sectorData) {
      setSectorCoordinates(sectorData);
    }
  }, [sectorData, sectorError]);

  const [sectorCoordinates, setSectorCoordinates] = useState(() => {
    let newArr: any[] = [];
    for (let i = 0; i < sectors.length + 2; i++) {
      // +2 because of time when Spots arent loaded yet
      newArr.push({ rowStart: 1, colStart: i * 2 });
    }
    return newArr;
  });
  const startingCoordinates = useRef({ x: 0, y: 0 });
  const mouseDown = useRef(-1);

  function mouseDownHandler(e: any, sector: number) {
    startingCoordinates.current = {
      x: e.clientX,
      y: e.clientY,
    };
    mouseDown.current = sector;
    console.log(startingCoordinates.current);
  }

  function mouseUpHandler(e: any) {
    console.log(mouseDown.current);
    fetch("/api/sectorCoordinates", {
      method: "POST",
      body: JSON.stringify({
        index: mouseDown.current + 1, // +1 because db indexing starts from 1
        rowStart: sectorCoordinates[mouseDown.current]?.rowStart,
        colStart: sectorCoordinates[mouseDown.current]?.colStart,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    mouseDown.current = -1;
  }

  function mouseMoveHandler(e: any) {
    if (mouseDown.current != -1) {
      const stepX = 80;
      const stepY = 80;
      let xDiff = e.clientX - startingCoordinates.current.x;
      let yDiff = e.clientY - startingCoordinates.current.y;
      if (Math.abs(xDiff) > stepX) {
        console.log("stepX");
        startingCoordinates.current = {
          x: e.clientX,
          y: startingCoordinates.current.y,
        };
        setSectorCoordinates((prev) => {
          let newCoordinates = [...prev];
          newCoordinates[mouseDown.current].colStart += xDiff > 0 ? 1 : -1;
          return newCoordinates;
        });
      }
      if (Math.abs(yDiff) > stepY) {
        console.log("stepY");
        startingCoordinates.current = {
          x: startingCoordinates.current.x,
          y: e.clientY,
        };
        setSectorCoordinates((prev) => {
          let newCoordinates = [...prev];
          newCoordinates[mouseDown.current].rowStart += yDiff > 0 ? 1 : -1;
          return newCoordinates;
        });
      }
    }
  }
  /* <--------> */

  return (
    <Box
      h="100%"
      onMouseMove={(e) => mouseMoveHandler(e)}
      onMouseUp={(e) => mouseUpHandler(e)}
    >
      <Flex flexDirection="column" align="center" h="fit-content" mb={2}>
        <Text as="h1" fontWeight="thin" fontSize="4xl" mb={2} align="center">
          Parking checker system
        </Text>
        <Flex gap={5}>
          <IconButton aria-label="Toggle Mode" onClick={toggleColorMode}>
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          <Popover trigger="hover">
            <PopoverTrigger>
              <IconButton aria-label="legend-icon-button">
                <InfoOutlineIcon />
              </IconButton>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Legend</PopoverHeader>
              <PopoverBody>
                <Flex flexDirection="row" my={2}>
                  <Box p={3} bg="teal.500" borderRadius="md"></Box>&nbsp;
                  <Text>is free</Text>
                </Flex>
                <Flex flexDirection="row" my={2}>
                  <Box p={3} bg="red.500" borderRadius="md"></Box>&nbsp;
                  <Text>is occupied</Text>
                </Flex>
                <Flex flexDirection="row" my={2}>
                  <Box p={3} bg="purple.500" borderRadius="md"></Box>&nbsp;
                  <Text>is unknown</Text>
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
        <Flex>
          {spinner ? (
            <Spinner size="xl" mt={100} color="teal.500" />
          ) : (
            <Grid
              h="80vh"
              w="fit-content"
              templateColumns={`repeat(${6}, 1fr)`}
              p={5}
              m={5}
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              templateRows={`repeat(${11}, 9%)`}
              grid-flow-row="true"
              border={"1px solid"}
              gap={1}
            >
              {sectors.map((sector: number) => {
                Incrementer += 1;
                return (
                  <Flex
                    onMouseDown={(e) => mouseDownHandler(e, sector)}
                    bg={
                      colorMode === "light"
                        ? "blackAlpha.400"
                        : "whiteAlpha.400"
                    }
                    direction="row"
                    key={sector}
                    w="fit-content"
                    borderRadius="md"
                    gridRowStart={sectorCoordinates[sector].rowStart}
                    gridRowEnd={
                      sectorCoordinates[sector].rowStart +
                      ((): number => {
                        let firstCol: Spot[] = Spots.filter(
                          (current: Spot) =>
                            current.id[0] ==
                            alphabet[sector + Incrementer - 1].toLowerCase()
                        );
                        let secondCol: Spot[] = Spots.filter(
                          (current: Spot) =>
                            current.id[0] ==
                            alphabet[sector + Incrementer].toLowerCase()
                        );
                        return firstCol.length > secondCol.length
                          ? firstCol.length
                          : secondCol.length;
                      })()
                    }
                    gridColumnStart={sectorCoordinates[sector].colStart}
                  >
                    <Flex direction="column">
                      {Spots.map((current) => {
                        if (
                          current.id[0] ==
                          alphabet[sector + Incrementer - 1].toLowerCase()
                        ) {
                          if (current.status === 1) statusColor = "teal";
                          else if (current.status === 2) statusColor = "red";
                          else statusColor = "purple";
                          return (
                            <span key={current.id}>
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    color="white"
                                    p={3}
                                    px={5}
                                    m={3}
                                    bg={statusColor + ".500"}
                                    borderRadius="md"
                                    className="tw-uppercase"
                                  >
                                    {current.id}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent w={200}>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader>
                                    <span className="tw-uppercase">
                                      {current.id}
                                    </span>{" "}
                                    | Parking slot
                                  </PopoverHeader>
                                  <PopoverBody>
                                    <Text
                                      color={
                                        colorMode === "light"
                                          ? statusColor + ".600"
                                          : statusColor + ".300"
                                      }
                                    >
                                      <span className="tw-uppercase">
                                        {current.id}
                                      </span>{" "}
                                      is
                                      {current.status === 1 ? " free." : ""}
                                      {current.status === 2 ? " occupied." : ""}
                                      {current.status === 3 ? (
                                        <span>
                                          {" "}
                                          unknown. <br />
                                          Please check arduino's sensor.
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </Text>
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                              <Divider
                                mt={-2}
                                orientation="horizontal"
                                w="100%"
                                h="2px"
                              />
                            </span>
                          );
                        }
                      })}
                    </Flex>
                    <Divider orientation="vertical" />
                    <Flex direction="column">
                      {Spots.map((current) => {
                        if (
                          current.id[0] ==
                          alphabet[sector + Incrementer].toLowerCase()
                        ) {
                          if (current.status === 1) statusColor = "teal";
                          else if (current.status === 2) statusColor = "red";
                          else statusColor = "purple";
                          return (
                            <span key={current.id}>
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    color="white"
                                    p={3}
                                    px={5}
                                    m={3}
                                    bg={statusColor + ".500"}
                                    borderRadius="md"
                                    className="tw-uppercase"
                                  >
                                    {current.id}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent w={200}>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader>
                                    <span className="tw-uppercase">
                                      {current.id}
                                    </span>{" "}
                                    | Parking slot
                                  </PopoverHeader>
                                  <PopoverBody>
                                    <Text
                                      color={
                                        colorMode === "light"
                                          ? statusColor + ".600"
                                          : statusColor + ".300"
                                      }
                                    >
                                      <span className="tw-uppercase">
                                        {current.id}
                                      </span>{" "}
                                      is
                                      {current.status === 1 ? " free." : ""}
                                      {current.status === 2 ? " occupied." : ""}
                                      {current.status === 3 ? (
                                        <span>
                                          {" "}
                                          unknown. <br />
                                          Please check arduino's sensor.
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </Text>
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                              <Divider
                                mt={-2}
                                orientation="horizontal"
                                w="100%"
                                h="2px"
                              />
                            </span>
                          );
                        }
                      })}
                    </Flex>
                  </Flex>
                );
              })}
            </Grid>
          )}
        </Flex>
        <Text fontSize="xs" mt={10} fontWeight="100">
          Made by Radim Kotajny & Filip Valentiny | &copy;{" "}
          {new Date().getFullYear()}
        </Text>
      </Flex>
    </Box>
  );
}
