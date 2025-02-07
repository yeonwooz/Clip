"use client";

import { ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Button, Container, Input, Select, Text, useToast, VStack } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { endDateAtom, minAtom, regionAtom, startDateAtom } from "~/store/atom";
import { LeftIcon, leftIconAtom, pageTitleAtom, RightIcon, rightIconAtom } from "~/store/headerAtoms";
import { shouldFetchScheduleAtom } from "~/store/scheduleAtom";
import { tripRequestDummy } from "./dummy";

export default function TripPage() {
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripStyle, setTripStyle] = useState("");
  const [isFormComplete, setIsFormComplete] = useState(false);

  const [, setPageTitle] = useAtom(pageTitleAtom);
  const [, setLeftIcon] = useAtom(leftIconAtom);
  const [, setRightIcon] = useAtom(rightIconAtom);
  const [region] = useAtom(regionAtom);

  const [, setStartDateAtom] = useAtom(startDateAtom);
  const [, setEndDateAtom] = useAtom(endDateAtom);
  const [, setMinAtom] = useAtom(minAtom);
  const [, setShouldFetch] = useAtom(shouldFetchScheduleAtom);

  const toast = useToast();

  useEffect(() => {
    if (tripName && startDate && endDate && tripStyle) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  }, [tripName, startDate, endDate, tripStyle]);

  const handleCreateSchedule = () => {
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // setStartDateAtom(
    //   `${startDateTime.getFullYear()}${String(startDateTime.getMonth() + 1).padStart(2, "0")}${String(
    //     startDateTime.getDate()
    //   ).padStart(2, "0")}${String(startDateTime.getHours()).padStart(2, "0")}`
    // );
    // setEndDateAtom(
    //   `${endDateTime.getFullYear()}${String(endDateTime.getMonth() + 1).padStart(2, "0")}${String(
    //     endDateTime.getDate()
    //   ).padStart(2, "0")}${String(endDateTime.getHours()).padStart(2, "0")}`
    // );
    // setMinAtom(tripStyle === "여유롭게" ? 4 : null);

    // 더미데이터 이용
    setStartDateAtom(tripRequestDummy.startDate);
    setEndDateAtom(tripRequestDummy.endDate);
    setMinAtom(tripRequestDummy.min);

    toast({
      title: "일정이 저장되었습니다.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setShouldFetch(true);
    router.push("/schedule");
  };

  useEffect(() => {
    setPageTitle(`${region} 여행`);
    setLeftIcon(LeftIcon.back);
    setRightIcon(RightIcon.calendar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box minHeight="100vh" bg="white">
      <Container maxW="container.sm" pt={4}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Text mb={2} fontWeight="bold">
              여행 이름
            </Text>
            <Input
              placeholder="여행의 이름을 작성해주세요"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
          </Box>

          <Box>
            <Text mb={2} fontWeight="bold">
              여행 시작일
            </Text>
            <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Box>

          <Box>
            <Text mb={2} fontWeight="bold">
              여행 종료일
            </Text>
            <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Box>

          <Box>
            <Text mb={2} fontWeight="bold">
              여행 스타일
            </Text>
            <Select
              placeholder="선택해주세요"
              icon={<ChevronDownIcon />}
              value={tripStyle}
              onChange={(e) => setTripStyle(e.target.value)}
            >
              <option value="상관없음">상관없음</option>
              <option value="여유롭게">여유롭게</option>
            </Select>
          </Box>
        </VStack>
      </Container>

      <Box position="fixed" bottom={8} left={0} right={0} px={4}>
        <Button
          width="100%"
          colorScheme="pink"
          bg="#ee4865"
          color="white"
          size="lg"
          _hover={{ bg: "#d63d59" }}
          isDisabled={!isFormComplete}
          onClick={handleCreateSchedule}
        >
          일정 생성하기
        </Button>
      </Box>
    </Box>
  );
}
