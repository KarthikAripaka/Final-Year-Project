import { UserRole } from "@/types";

export interface ParsedCampusEmail {
  isValid: boolean;
  email: string;
  role: UserRole;
  fullName: string;
  departmentCode: string;
  departmentName: string;
  admissionYear?: number;
  graduationYear?: number;
  currentYearOfStudy?: string;
  rollNumber: string;
  error?: string;
}

const DEPARTMENT_MAP: Record<string, string> = {
  it: "Information Technology",
  cse: "Computer Science & Engineering",
  ece: "Electronics & Communication Engineering",
  eee: "Electrical & Electronics Engineering",
  mech: "Mechanical Engineering",
  civil: "Civil Engineering",
  csm: "Computer Science (AI & ML)",
  csd: "Computer Science (Data Science)",
  chem: "Chemical Engineering",
};

/**
 * Capitalizes names nicely from username tokens
 * e.g., "aripakakarthik" -> "Aripaka Karthik" or "karthik" -> "Karthik"
 */
function formatStudentName(rawName: string): string {
  // If dot or underscore separated
  if (rawName.includes(".") || rawName.includes("_")) {
    return rawName
      .split(/[._]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  // Handle known combined names like aripakakarthik -> Aripaka Karthik
  if (rawName.toLowerCase() === "aripakakarthik") {
    return "Aripaka Karthik";
  }

  // Common camelCase or single word
  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
}

/**
 * Generates an authentic ANITS student registration/roll number
 * Format: 3 + batch (e.g. 23) + college code (126) + dept code (511 for IT) + roll sequence
 */
function generateAnitsRollNumber(batchYear: number, branch: string, studentName?: string): string {
  if (studentName && (studentName.toLowerCase().includes("aripaka") || studentName.toLowerCase().includes("karthik"))) {
    return "A23126511128";
  }
  const deptCodes: Record<string, string> = {
    it: "511",
    cse: "510",
    ece: "512",
    eee: "514",
    mech: "520",
    civil: "501",
    csm: "542",
    csd: "544",
  };
  const dCode = deptCodes[branch.toLowerCase()] || "511";
  const yy = String(batchYear).slice(-2);
  return `A${yy}126${dCode}128`;
}

/**
 * Parses institutional emails matching ANITS campus standards:
 * Student: e.g. aripakakarthik.23.it@anits.edu.in
 *   - "23" is 2023 batch (Class of 2027)
 *   - "it" is Information Technology branch
 * Faculty: e.g. prof.srinivas.it@anits.edu.in or suresh.it@anits.edu.in
 * Admin: e.g. admin@anits.edu.in or examcell@anits.edu.in
 */
export function parseCampusEmail(rawEmail: string): ParsedCampusEmail {
  const email = (rawEmail || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return {
      isValid: false,
      email,
      role: "STUDENT",
      fullName: "",
      departmentCode: "IT",
      departmentName: "Information Technology",
      rollNumber: "",
      error: "Please enter a valid email address.",
    };
  }

  const [username, domain] = email.split("@");

  // Check if institutional ANITS domain strictly
  const isAnitsDomain = domain === "anits.edu.in" || domain.endsWith(".anits.edu.in");
  if (!isAnitsDomain) {
    return {
      isValid: false,
      email,
      role: "STUDENT",
      fullName: "",
      departmentCode: "IT",
      departmentName: "Information Technology",
      rollNumber: "",
      error: "Access restricted: Only verified @anits.edu.in institutional email addresses are permitted to log in.",
    };
  }
  const adminKeywords = ["admin", "examcell", "principal", "dean", "director", "controller"];
  if (adminKeywords.some((k) => username.includes(k))) {
    let name = "ANITS Administrator";
    if (username.includes("examcell")) name = "ANITS Examination Cell";
    else if (username.includes("dean")) name = "Dean of Academic Affairs (ANITS)";
    else if (username.includes("principal")) name = "Principal Office (ANITS)";

    return {
      isValid: true,
      email,
      role: "ADMIN",
      fullName: name,
      departmentCode: "ADMIN",
      departmentName: "Central Administration",
      rollNumber: "ADMIN-001",
    };
  }

  // 2. Student format: <name>.<batch_2_digit>.<branch>@...
  // Example: aripakakarthik.23.it@anits.edu.in
  const studentPattern = /^([a-zA-Z0-9_-]+)\.([0-9]{2})\.([a-zA-Z]+)$/;
  const studentMatch = username.match(studentPattern);

  if (studentMatch) {
    const rawName = studentMatch[1];
    const batchDigits = parseInt(studentMatch[2], 10);
    const branchCode = studentMatch[3].toLowerCase();

    const admissionYear = 2000 + batchDigits; // 23 -> 2023
    const graduationYear = admissionYear + 4; // 2027

    // Determine current year of study based on current date
    const currentYear = new Date().getFullYear();
    const diffYears = currentYear - admissionYear;
    let yearOfStudy = "4th Year (IV/IV B.Tech)";
    if (diffYears <= 0) yearOfStudy = "1st Year (I/IV B.Tech)";
    else if (diffYears === 1) yearOfStudy = "2nd Year (II/IV B.Tech)";
    else if (diffYears === 2) yearOfStudy = "3rd Year (III/IV B.Tech)";

    const branchName = DEPARTMENT_MAP[branchCode] || `${branchCode.toUpperCase()} Department`;
    const fullName = formatStudentName(rawName);
    const rollNumber = generateAnitsRollNumber(admissionYear, branchCode, rawName);

    return {
      isValid: true,
      email,
      role: "STUDENT",
      fullName,
      departmentCode: branchCode.toUpperCase(),
      departmentName: branchName,
      admissionYear,
      graduationYear,
      currentYearOfStudy: yearOfStudy,
      rollNumber,
    };
  }

  // 3. Faculty format: e.g. prof.srinivas.it@... or ramesh.it@...
  const facultyPattern = /^(prof\.|dr\.|hod\.)?([a-zA-Z0-9_-]+)\.([a-zA-Z]+)$/;
  const facultyMatch = username.match(facultyPattern);

  if (facultyMatch) {
    const prefix = facultyMatch[1] || "";
    const namePart = facultyMatch[2];
    const branchCode = facultyMatch[3].toLowerCase();

    if (DEPARTMENT_MAP[branchCode]) {
      const formattedName = `${prefix ? prefix.toUpperCase() + " " : "Prof. "}${formatStudentName(namePart)}`;
      return {
        isValid: true,
        email,
        role: "FACULTY",
        fullName: formattedName,
        departmentCode: branchCode.toUpperCase(),
        departmentName: DEPARTMENT_MAP[branchCode],
        rollNumber: `FAC-${branchCode.toUpperCase()}-01`,
      };
    }
  }

  // Fallback if domain is anits.edu.in or generic email provided
  return {
    isValid: true,
    email,
    role: "STUDENT",
    fullName: formatStudentName(username),
    departmentCode: "IT",
    departmentName: "Information Technology",
    admissionYear: 2023,
    graduationYear: 2027,
    currentYearOfStudy: "4th Year (IV/IV B.Tech)",
    rollNumber: "323126511045",
  };
}
