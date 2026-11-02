export const getVacancyData = (vacancyType, vacancy) => {
    let vacancyData = {
      vacancy_title: "",
      school: "",
      school_id: "",
      designation: "",
      designation_id: "",
      staff_name: "",
      staff_id: "",
      vacancy_nature: vacancyType,
      vacancy_start_date: "",
      remarks: "",
      fk_ref_id: "",
    };
  
    switch (vacancyType) {
      case "obituary":
        vacancyData = {
          ...vacancyData,
          vacancy_title: `Vacancy due to death of ${vacancy.staff_official_name}`,
          school: vacancy.school_location || "",
          school_id: vacancy.school_id || "",
          designation: vacancy.latest_service_record?.designation_name || "",
          designation_id: vacancy.latest_service_record?.designation_id || "",
          staff_name: vacancy.staff_official_name || "",
          staff_id: vacancy.staff_id || "",
          fk_ref_id: vacancy.death_id || "",
        };
        break;
  
      case "resignation":
        vacancyData = {
          ...vacancyData,
          vacancy_title: `Vacancy due to resignation of ${vacancy.staff_official_name}`,
          school: vacancy.school_location || "",
          school_id: vacancy.school_id || "",
          designation: vacancy.latest_service_record?.designation_name || "",
          designation_id: vacancy.latest_service_record?.designation_id || "",
          staff_name: vacancy.staff_official_name || "",
          staff_id: vacancy.staff_id || "",
          fk_ref_id: vacancy.resignation_id	||"",
        };
        break;
  
      case "retirement":
        vacancyData = {
          ...vacancyData,
          vacancy_title: `Vacancy due to retirement of ${vacancy.staff_name}`,
          school: vacancy.school_name || "",
          school_id: vacancy.school_id || "",
          designation: vacancy.designation_name || "",
          designation_id: vacancy.designation_id || "",
          staff_name: vacancy.staff_name || "",
          staff_id: vacancy.staff_id || "",
          fk_ref_id: vacancy.retirement_id || vacancy.service_id || "",
        };
        break;
  
      case "transfer":
        vacancyData = {
          ...vacancyData,
          vacancy_title: `Vacancy due to transfer of ${vacancy.staff_name}`,
          school: vacancy.school_name || "",
          school_id: vacancy.school_id || "",
          designation: vacancy.designation_name || "",
          designation_id: vacancy.designation_id || "",
          staff_name: vacancy.staff_name || "",
          staff_id: vacancy.staff_id || "",
          fk_ref_id: vacancy.transfer_id || vacancy.service_id || "",
        };
        break;
  
      case "leave":
        vacancyData = {
          ...vacancyData,
          vacancy_title: `Vacancy due to leave of ${vacancy.staff_name}`,
          school: vacancy.school_name || "",
          school_id: vacancy.school_id || "",
          designation: vacancy.designation_name || "",
          designation_id: vacancy.designation_id || "",
          staff_name: vacancy.staff_name || "",
          staff_id: vacancy.staff_id || "",
          fk_ref_id: vacancy.leave_id || vacancy.service_id || "",
        };
        break;
  
      case "promotion":
        vacancyData = {
          ...vacancyData,
          vacancy_title: `Vacancy due to promotion of ${vacancy.staff_name}`,
          school: vacancy.school_name || "",
          school_id: vacancy.school_id || "",
          designation: vacancy.designation_name || "",
          designation_id: vacancy.designation_id || "",
          staff_name: vacancy.staff_name || "",
          staff_id: vacancy.staff_id || "",
          fk_ref_id: vacancy.promotion_id || vacancy.service_id || "",
        };
        break;
  
      default:
        // Default case
        vacancyData = {
          ...vacancyData,
          vacancy_title: `Vacancy due to ${vacancyType}`,
          school: vacancy.school_name || vacancy.school_location || "",
          school_id: vacancy.school_id || "",
          designation: vacancy.designation_name || "",
          designation_id: vacancy.designation_id || "",
          staff_name: vacancy.staff_name || vacancy.staff_official_name || "",
          staff_id: vacancy.staff_id || "",
        };
    }
  
    return vacancyData;
  };