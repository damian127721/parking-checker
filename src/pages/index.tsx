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
import {
  InfoOutlineIcon,
  MoonIcon,
  SunIcon,
  RepeatIcon,
  SmallCloseIcon,
  AddIcon,
} from "@chakra-ui/icons";
import React, { use, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Spot, SectorCoordinates } from "@/pages/spot";
import { preProcessFile } from "typescript";

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
const fetcherD = (url: string) => {
  return fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/* function uniqueLetterCount(Spots: Spot[]): number {
  let newArray: String[] = ["a"];

  Spots.map((spot: Spot): void => {
    newArray.push(spot.id[0]?.toLowerCase());
  });
  let uniqueChars: String[] = [...new Set(newArray)];
  return uniqueChars.length;
} */

export default function Home() {
  const [spinner, setSpinner] = useState(false);

  /* const initialSpot: Spot = {
    id: "",
    status: 0,
  }; */
  const url = "/api/parking";

  const [Spots, setSpots] = useState<Spot[]>([]);
  const { data, error } = useSWR(url, fetcher, { refreshInterval: 15000 });

  // remove initial state collision
  useEffect(() => {
    setSpots([]);
  }, []);
  useEffect(() => {
    //console.log(error)
    setSpinner(true);
    if (data) {
      const sortedData = data.sort(
        ({ id: a }: { id: string }, { id: b }: { id: string }) => {
          return parseInt(a.slice(1)) - parseInt(b.slice(1));
        }
      );
      //  console.log(sortedData);
      setSpots(sortedData);
      setSpinner(false);
    }
  }, [data, error]);
  let Incrementer: number = 0;
  let statusColor: string;

  const { colorMode, toggleColorMode } = useColorMode();

  /* <-- EDITABILITY FEATURE --> */
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const startingCoordinates = useRef({ x: 0, y: 0 });
  const mouseDown = useRef<number>(-1);
  const [editAccessGranted, setEditAccessGranted] = useState<boolean>(false);
  const editAccessPassword = useRef("");
  const ID = useRef("");
  const EUI = useRef("");
  const status = useRef(1);
  const rows: number = 13; // Can be adjusted
  const cols: number = 5; // Can be adjusted
  const [minCols, setMinCols] = useState<number>(1);
  const [minRows, setMinRows] = useState<number>(1);
  const maxSectors: number = 10;
  const {
    data: sectorData,
    error: sectorError,
  }: { data: SectorCoordinates[]; error: any } = useSWR(
    "/api/sectorCoordinates",
    fetcher
  );

  const [sectorCoordinates, setSectorCoordinates] = useState<
    SectorCoordinates[]
  >([]);
  const [rowsEnds, setRowsEnds] = useState<number[]>([]);

  let [sectors, setSectors] = useState<number[]>([]);
  useEffect(() => {
    if (!sectorData) return;
    const sortedSectorData = sectorData.sort(
      ({ index: a }: { index: number }, { index: b }: { index: number }) =>
        a - b
    );

    setSectorCoordinates(sortedSectorData);
    setSectors([...Array(Math.round(sortedSectorData.length)).keys()]);
  }, [sectorData]);

  useEffect(() => {
    setMinCols(
      Math.max(
        ...sectorCoordinates.map(
          (item, index) =>
            item.colStart +
            (sectorCoordinates[index].rotated
              ? Math.ceil(rowsEnds[index] / 3)
              : 0) -
            1 // -1 because there is one more lines thar columns
        )
      )
    );
  }, [sectorCoordinates]);

  const [secondRotatedColsLengths, setSecondRotatedColsLengths] = useState<
    number[]
  >([]);

  useEffect(() => {
    let increment: number = 0;
    const rowsEndsArray: number[] = sectors.map((sector: number) => {
      increment++;
      const secondColsArray: number[] = [];
      const endsArray = ((): number => {
        let firstCol: Spot[] = Spots.filter(
          (current: Spot) =>
            current.id[0].toLowerCase() ==
            alphabet[sector + increment - 1].toLowerCase()
        );
        let secondCol: Spot[] = Spots.filter(
          (current: Spot) =>
            current.id[0].toLowerCase() ==
            alphabet[sector + increment].toLowerCase()
        );
        secondColsArray.push(secondCol.length);
        return firstCol.length > secondCol.length
          ? firstCol.length
          : secondCol.length;
      })();
      setSecondRotatedColsLengths(secondColsArray);
      return endsArray;
    });
    setRowsEnds(rowsEndsArray);
    setMinRows(
      Math.max(
        ...rowsEndsArray.map(
          (elem, index) =>
            (sectorCoordinates[index].rotated
              ? secondRotatedColsLengths[index] > 0
                ? 2
                : 1
              : elem) + sectorCoordinates[index].rowStart
        )
      ) - 1
    );
  }, [sectorCoordinates, Spots]);

  function mouseDownHandler(e: React.MouseEvent, sector: number) {
    if (editAccessGranted === false) return;
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
          if (
            xDiff > 0 &&
            (newCoordinates[mouseDown.current]?.rotated
              ? Math.ceil(rowsEnds[mouseDown.current] / 3)
              : 1) +
              prev[mouseDown.current].colStart +
              1 <=
              cols + 1
          ) {
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
          if (
            yDiff > 0 &&
            (newCoordinates[mouseDown.current]?.rotated
              ? 2
              : rowsEnds[mouseDown.current]) +
              sectorCoordinates[mouseDown.current].rowStart +
              1 <=
              rows + 1
          ) {
            //rows + 1 because there is one more line than rows
            newCoordinates[mouseDown.current].rowStart += 1;
          }
          return newCoordinates;
        });
      }
    }
  }

  function toggleRotated(sectorToRotate: number) {
    setSectorCoordinates((prev) => {
      let newCoordinates = [...prev];
      newCoordinates[sectorToRotate].rotated =
        !newCoordinates[sectorToRotate].rotated;
      fetcherP("/api/sectorCoordinates", {
        password: editAccessPassword.current,
        index: sectorToRotate + 1, // +1 because db indexing starts from 1
        rowStart: newCoordinates[sectorToRotate].rowStart,
        colStart: newCoordinates[sectorToRotate].colStart,
        rotated: newCoordinates[sectorToRotate].rotated,
      });
      return newCoordinates;
    });
  }

  function passwordAuthorizer() {
    fetcherP("/api/authorize", { password: editAccessPassword.current }).then(
      (res) => {
        if (res.status === 200) {
          setEditAccessGranted(true);
        } else {
          setEditAccessGranted(false);
        }
      }
    );
  }

  function adminLoginModalLogic(e: React.KeyboardEvent) {
    // CTRL + A, opens admin login modal for access to editability
    if (e.key === "a") {
      if (e.getModifierState("Control")) {
        setEditAccessGranted(false);
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
      <Flex flexDirection="column" align="center" h="100%" mb={2} w="100%">
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
        <Modal isOpen={isOpen2} onClose={onClose2}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Spot</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="ID"
                onChange={(e) => {
                  ID.current = e.target.value;
                }}
              />
              <Input
                placeholder="EUI"
                onChange={(e) => {
                  EUI.current = e.target.value;
                }}
              />
              <Input
                placeholder="status"
                onChange={(e) => {
                  status.current = parseInt(e.target.value);
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  fetcherD(
                    "/api/sectorCoordinates?index=" + sectorCoordinates.length
                  );
                  setSectorCoordinates((prev) => {
                    return prev.slice(0, -1);
                  });
                  setSectors((prev) => prev.slice(0, -1));
                }}
                colorScheme="red"
              >
                Delete latest sector
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  fetcherP("/api/sectorCoordinates?action=create", {
                    index: sectorCoordinates.length + 1,
                    password: editAccessPassword.current,
                  });
                  setSectorCoordinates((prev) => {
                    return [
                      ...prev,
                      {
                        rowStart: 1,
                        colStart: 0,
                        rotated: false,
                        index: sectorCoordinates.length,
                      },
                    ];
                  });
                  setSectors((prev) => [...prev, sectorCoordinates.length]);
                }}
              >
                Add Sector
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  fetcherP("/api/parking?action=create", {
                    id: ID.current,
                    EUI: EUI.current,
                    data: status.current,
                    password: editAccessPassword.current,
                  });
                  setSpots((prev) => [
                    ...prev,
                    { id: ID.current, status: status.current },
                  ]);
                }}
              >
                Create Spot
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
          display={{ base: "none", md: "block" }}
        >
          Parking checker system
        </Text>
        <Flex gap={5} display={{ base: "none", md: "block" }}>
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
          {editAccessGranted && (
            <IconButton aria-label="add-spot" onClick={onOpen2}>
              <AddIcon />
            </IconButton>
          )}
        </Flex>
        <Flex
          flexDirection={"column"}
          minH={{ base: "90vh", md: "fit-content" }}
          justifyContent="center"
        >
          <IconButton
            alignSelf={"flex-end"}
            aria-label="Toggle Mode"
            onClick={toggleColorMode}
            display={{ base: "block", md: "none" }}
          >
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          {spinner ? (
            <Spinner size="xl" mt={{ base: 100 }} color="teal.500" />
          ) : (
            <Grid
              overflow={"hidden"}
              flexShrink={2}
              h={{ base: "fit-content" }}
              w={{ base: "100vw", md: "fit-content" }}
              templateColumns={{
                base: `repeat(${minCols}, 1fr)`,
                md: `repeat(${editAccessGranted ? cols : minCols}, 1fr)`,
              }}
              p={{ base: 0, md: 5 }}
              m={{ base: 0, md: 5 }}
              mt={5}
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              templateRows={{
                base: `repeat(${minRows}, 26px)`,
                sm: `repeat(${minRows}, 36px)`,
                md: `repeat(${editAccessGranted ? rows : minRows}, 36px)`,
                xl: `repeat(${editAccessGranted ? rows : minRows}, 1fr)`,
              }}
              grid-flow-row="true"
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
                    direction={`${
                      sectorCoordinates[sector]?.rotated ? "column" : "row"
                    }`}
                    key={sector}
                    w="100%"
                    borderRadius="md"
                    gridRowStart={sectorCoordinates[sector].rowStart}
                    gridRowEnd={
                      sectorCoordinates[sector].rotated
                        ? secondRotatedColsLengths[sector] > 0
                          ? sectorCoordinates[sector].rowStart + 2
                          : sectorCoordinates[sector].rowStart + 1
                        : rowsEnds[sector] + sectorCoordinates[sector].rowStart
                    }
                    gridColumnStart={sectorCoordinates[sector].colStart}
                    gridColumnEnd={
                      sectorCoordinates[sector].rotated
                        ? Math.ceil(rowsEnds[sector] / 3) +
                          sectorCoordinates[sector].colStart
                        : "auto"
                    }
                    border={{ base: "1px solid", md: "none" }}
                    className="sector"
                    position={"relative"}
                    top="0"
                    left="0"
                  >
                    <Flex
                      direction={`${
                        sectorCoordinates[sector]?.rotated ? "row" : "column"
                      }`}
                      w="100%"
                      alignItems={"center"}
                      position={"relative"}
                    >
                      {Spots.map((current) => {
                        if (
                          current.id[0]?.toLowerCase() ==
                          alphabet[sector + Incrementer - 1].toLowerCase()
                        ) {
                          if (current.status === 1) statusColor = "teal";
                          else if (current.status === 2) statusColor = "red";
                          else statusColor = "purple";
                          return (
                            <Box
                              key={current.id}
                              w={{ base: "100%", md: "fit-content" }}
                              h={"fit-content"}
                              position={"relative"}
                            >
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    w={{
                                      base: "100%",
                                      md: "fit-content",
                                    }}
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
                                          Please check arduino&apos;s sensor.
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
                                display={{ base: "none", md: "block" }}
                              />
                              {editAccessGranted && (
                                <SmallCloseIcon
                                  display={"block"}
                                  position={"absolute"}
                                  bottom={0}
                                  left={0}
                                  cursor={"pointer"}
                                  zIndex={1}
                                  onClick={() => {
                                    setSpots((prev) =>
                                      prev.filter(
                                        (spot) => spot.id !== current.id
                                      )
                                    );
                                    fetcherD("/api/parking?id=" + current.id);
                                  }}
                                />
                              )}
                            </Box>
                          );
                        }
                      })}
                    </Flex>
                    {sectorCoordinates[sector].rotated || (
                      <Divider orientation="vertical" />
                    )}
                    <Flex
                      direction={`${
                        sectorCoordinates[sector]?.rotated ? "row" : "column"
                      }`}
                      w="100%"
                      alignItems={"center"}
                    >
                      {Spots.map((current) => {
                        if (
                          current.id[0]?.toLowerCase() ==
                          alphabet[sector + Incrementer].toLowerCase()
                        ) {
                          if (current.status === 1) statusColor = "teal";
                          else if (current.status === 2) statusColor = "red";
                          else statusColor = "purple";
                          return (
                            <Box
                              key={current.id}
                              w={{ base: "100%", md: "fit-content" }}
                              position={"relative"}
                            >
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    position={"relative"}
                                    color="white"
                                    p={{ base: 0, md: 3 }}
                                    px={{ base: 0, md: 5 }}
                                    m={{ base: 0, md: 3 }}
                                    bg={statusColor + ".500"}
                                    borderRadius="md"
                                    className="tw-uppercase"
                                    w={{ base: "100%", md: "fit-content" }}
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
                                          Please check arduino&apos;s sensor.
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
                                display={{ base: "none", md: "block" }}
                              />
                              {editAccessGranted && (
                                <SmallCloseIcon
                                  display={"block"}
                                  position={"absolute"}
                                  bottom={0}
                                  left={0}
                                  cursor={"pointer"}
                                  zIndex={1}
                                  onClick={() => {
                                    setSpots((prev) =>
                                      prev.filter(
                                        (spot) => spot.id !== current.id
                                      )
                                    );
                                    fetcherD("/api/parking?id=" + current.id);
                                  }}
                                />
                              )}
                            </Box>
                          );
                        }
                      })}
                    </Flex>
                    <IconButton
                      className="rotateIcon"
                      aria-label="Toggle Mode"
                      position={"absolute"}
                      bottom={0}
                      right={0}
                      hidden={editAccessGranted ? false : true}
                      onClick={() => toggleRotated(sector)}
                    >
                      <RepeatIcon />
                    </IconButton>
                  </Flex>
                );
              })}
            </Grid>
          )}
        </Flex>
        <Text
          fontSize="xs"
          my={4}
          fontWeight="100"
          display={{ base: "none", md: "block" }}
        >
          Made by Radim Kotajny & Filip Valentiny | <br /> Modified by Damián
          Čmiel & Antonín Vaněk | &copy; {new Date().getFullYear()}
        </Text>
      </Flex>
    </Box>
  );
}
