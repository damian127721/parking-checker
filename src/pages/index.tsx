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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/color-mode";
import { InfoOutlineIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import React, { use, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Spot, SectorCoordinates } from "@/pages/spot";

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
const fetcherP = (url: string, rawObject: Object) => {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(rawObject),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

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
  console.log(sectors);
  const { colorMode, toggleColorMode } = useColorMode();

  const [isUsingMobile, setIsUsingMobile] = useState(false);
  console.log(isUsingMobile);
  useEffect(() => {
    let checkMobile = false;
    if ("maxTouchPoints" in navigator) {
      checkMobile = navigator.maxTouchPoints > 0;
      setIsUsingMobile(checkMobile);
    }
  }, []);

  /* <-- EDITABILITY FEATURE --> */
  const { isOpen, onOpen, onClose } = useDisclosure();
  const startingCoordinates = useRef({ x: 0, y: 0 });
  const mouseDown = useRef<number>(-1);
  const editAccessGranted = useRef<boolean>(false);
  const editAccessPassword = useRef("");
  const rows: number = 11;
  const cols: number = 6;
  const maxSectors: number = 10;
  const {
    data: sectorData,
    error: sectorError,
  }: { data: SectorCoordinates[]; error: any } = useSWR(
    "/api/sectorCoordinates",
    fetcher
  );

  const [sectorCoordinates, setSectorCoordinates] = useState(() => {
    let newArr: any[] = [];
    for (let i = 0; i < maxSectors; i++) {
      newArr.push({ rowStart: 1, colStart: i * 2 });
    }
    return newArr;
  });
  const [rowsEnds, setRowsEnds] = useState<number[]>([]);

  useEffect(() => {
    if (sectorData) {
      setSectorCoordinates(
        sectorData.sort(
          ({ index: a }: { index: number }, { index: b }: { index: number }) =>
            a - b
        )
      );
    }
  }, [sectorData]);

  useEffect(() => {
    let increment: number = 0;
    const rowsEndsArray: number[] = sectors.map((sector: number) => {
      increment++;
      return (
        sectorCoordinates[sector].rowStart +
        ((): number => {
          let firstCol: Spot[] = Spots.filter(
            (current: Spot) =>
              current.id[0] == alphabet[sector + increment - 1].toLowerCase()
          );
          let secondCol: Spot[] = Spots.filter(
            (current: Spot) =>
              current.id[0] == alphabet[sector + increment].toLowerCase()
          );
          return firstCol.length > secondCol.length
            ? firstCol.length
            : secondCol.length;
        })()
      );
    });
    setRowsEnds(rowsEndsArray);
  }, [sectorCoordinates, Spots]);

  function mouseDownHandler(e: React.MouseEvent, sector: number) {
    if (editAccessGranted.current === false) return;
    startingCoordinates.current = {
      x: e.clientX,
      y: e.clientY,
    };
    mouseDown.current = sector;
  }

  function mouseUpHandler(e: React.MouseEvent) {
    if (mouseDown.current === -1) return;
    fetcherP("/api/sectorCoordinates", {
      password: editAccessPassword.current,
      index: mouseDown.current + 1, // +1 because db indexing starts from 1
      rowStart: sectorCoordinates[mouseDown.current]?.rowStart,
      colStart: sectorCoordinates[mouseDown.current]?.colStart,
    });

    mouseDown.current = -1;
  }

  function mouseMoveHandler(e: React.MouseEvent) {
    if (mouseDown.current != -1) {
      const stepX = 80;
      const stepY = 80;
      let xDiff = e.clientX - startingCoordinates.current.x;
      let yDiff = e.clientY - startingCoordinates.current.y;
      if (Math.abs(xDiff) > stepX) {
        startingCoordinates.current = {
          x: e.clientX,
          y: startingCoordinates.current.y,
        };
        setSectorCoordinates((prev) => {
          let newCoordinates = [...prev];
          if (xDiff > 0 && prev[mouseDown.current].colStart + 1 <= cols) {
            // because of 1 to be moved
            newCoordinates[mouseDown.current].colStart += 1;
          }
          if (xDiff < 0 && prev[mouseDown.current].colStart - 1 >= 1) {
            newCoordinates[mouseDown.current].colStart -= 1;
          }
          return newCoordinates;
        });
      }
      if (Math.abs(yDiff) > stepY) {
        startingCoordinates.current = {
          x: startingCoordinates.current.x,
          y: e.clientY,
        };
        setSectorCoordinates((prev) => {
          let newCoordinates = [...prev];
          if (
            yDiff < 0 &&
            newCoordinates[mouseDown.current].rowStart - 1 >= 1
          ) {
            newCoordinates[mouseDown.current].rowStart -= 1;
          }
          if (yDiff > 0 && rowsEnds[mouseDown.current] + 1 <= rows + 1) {
            //rows + 1 because there is one more line than rows
            newCoordinates[mouseDown.current].rowStart += 1;
          }
          return newCoordinates;
        });
      }
    }
  }

  function passwordAuthorizer() {
    fetcherP("/api/authorize", { password: editAccessPassword.current }).then(
      (res) => {
        if (res.status === 200) {
          editAccessGranted.current = true;
        } else {
          editAccessGranted.current = false;
        }
      }
    );
  }

  function adminLoginModalLogic(e: React.KeyboardEvent) {
    // CTRL + A, opens admin login modal for access to editability
    if (e.key === "a") {
      if (e.getModifierState("Control")) {
        editAccessGranted.current = false;
        editAccessPassword.current = "";
        onOpen();
      }
    }
  }

  /* <--------> */

  return (
    <Box
      h="100%"
      onMouseMove={(e) => mouseMoveHandler(e)}
      onMouseUp={(e) => mouseUpHandler(e)}
      onKeyDown={(e) => {
        adminLoginModalLogic(e);
      }}
      tabIndex={0}
    >
      <Flex flexDirection="column" align="center" h="fit-content" mb={2}>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Admin login</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Password"
                onChange={(e) => {
                  editAccessPassword.current = e.target.value;
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  passwordAuthorizer();
                  onClose();
                }}
              >
                Login
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Text
          as="h1"
          fontWeight="thin"
          fontSize="4xl"
          mb={2}
          align="center"
          hidden={isUsingMobile}
        >
          Parking checker system
        </Text>
        <Flex gap={5} hidden={isUsingMobile}>
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
        <Flex flexDirection={"column"} h={"100vh"}>
          <IconButton
            aria-label="Toggle Mode"
            onClick={toggleColorMode}
            hidden={!isUsingMobile}
          >
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          {spinner ? (
            <Spinner size="xl" mt={{ base: 100 }} color="teal.500" />
          ) : (
            <Grid
              flexShrink={2}
              h={isUsingMobile ? "100vh" : { md: "50rem" }}
              w={isUsingMobile ? "100%" : "fit-content"}
              templateColumns={`repeat(${cols}, 1fr)`}
              p={isUsingMobile ? 0 : { base: 0, md: 5 }}
              m={isUsingMobile ? 0 : { base: 0, md: 5 }}
              mt={5}
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              templateRows={{
                base: `repeat(${rows}, 26px)`,
                md: `repeat(${rows}, 36px)`,
                xl: `repeat(${rows}, 60px)`,
              }}
              grid-flow-row="true"
              border={isUsingMobile ? "" : "1px solid"}
              gap={{ base: 0, md: 1 }}
            >
              {sectors.map((sector: number) => {
                Incrementer += 1;
                return (
                  <Flex
                    onMouseDown={(e) => mouseDownHandler(e, sector)}
                    bg={{
                      base: "transparent",
                      md:
                        colorMode === "light"
                          ? "blackAlpha.400"
                          : "whiteAlpha.400",
                    }}
                    direction="row"
                    key={sector}
                    w="100%"
                    borderRadius="md"
                    gridRowStart={sectorCoordinates[sector].rowStart}
                    gridRowEnd={rowsEnds[sector]}
                    gridColumnStart={sectorCoordinates[sector].colStart}
                    border={{ base: "1px solid", md: "none" }}
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
                            <Box key={current.id} flexGrow={1}>
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    color="white"
                                    p={{ base: 0, md: 3 }}
                                    px={{ base: 0, md: 5 }}
                                    m={{ base: 0, md: 3 }}
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
                                    <span className="id tw-uppercase">
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
                            </Box>
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
                            <Box key={current.id} flexGrow={1}>
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    color="white"
                                    p={{ base: 0, md: 3 }}
                                    px={{ base: 0, md: 5 }}
                                    m={{ base: 0, md: 3 }}
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
                                      <span className="id tw-uppercase">
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
                            </Box>
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
        <Text fontSize="xs" mt={10} fontWeight="100" hidden={isUsingMobile}>
          Made by Radim Kotajny & Filip Valentiny | &copy;{" "}
          {new Date().getFullYear()}
        </Text>
      </Flex>
    </Box>
  );
}
