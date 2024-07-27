"use client";

import { Select } from "@chakra-ui/react";
import { atom, useAtom } from "jotai";
import { useRouter } from "next/navigation";
import React from "react";
import styles from "./userInfoForm.module.css";

const birthYearAtom = atom<string>("");
const genderAtom = atom<string>("");

// 추가: 폼 완성 여부를 체크하는 atom
const isFormCompleteAtom = atom((get) => get(birthYearAtom) !== "" && get(genderAtom) !== "");

const BirthYearSelect: React.FC = () => {
  const [birthYear, setBirthYear] = useAtom(birthYearAtom);
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(100), (val, index) => currentYear - index);

  return (
    <Select placeholder="선택해주세요" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} height={14}>
      {years.map((year) => (
        <option key={year} value={year.toString()}>
          {year}
        </option>
      ))}
    </Select>
  );
};

const GenderSelect: React.FC = () => {
  const [gender, setGender] = useAtom(genderAtom);

  return (
    <div className={styles.genderSelect}>
      <label className={`${styles.genderOption} ${gender === "여성" ? styles.selected : ""}`}>
        <input
          type="radio"
          name="gender"
          value="여성"
          checked={gender === "여성"}
          onChange={() => setGender("여성")}
          className={styles.radioInput}
        />
        여성
      </label>
      <label className={`${styles.genderOption} ${gender === "남성" ? styles.selected : ""}`}>
        <input
          type="radio"
          name="gender"
          value="남성"
          checked={gender === "남성"}
          onChange={() => setGender("남성")}
          className={styles.radioInput}
        />
        남성
      </label>
    </div>
  );
};

const UserInfoForm: React.FC = () => {
  const [isFormComplete] = useAtom(isFormCompleteAtom);
  const router = useRouter();

  const handleSubmit = () => {
    router.push('/chat');
  };

  return (
    <div className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.label}>출생연도</label>
        <BirthYearSelect />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>성별</label>
        <GenderSelect />
      </div>

      <button disabled={!isFormComplete} className={styles.submitButton} onClick={handleSubmit}>
        다음
      </button>
    </div>
  );
};

export default UserInfoForm;
