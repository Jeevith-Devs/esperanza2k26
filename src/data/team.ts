
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: string;
  subCategory?: string;
  image?: { url: string } | null;
  linkedin?: string;
  instagram?: string;
  order?: number;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Ganesh K",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Core Team",
    image: null,
    order: 1
  },
  {
    id: "2",
    name: "Suriya G",
    role: "Vice President",
    category: "Student Coordinators",
    subCategory: "Core Team",
    image: null,
    order: 2
  },
  {
    id: "3",
    name: "Arshandhan S U",
    role: "General Secretary",
    category: "Student Coordinators",
    subCategory: "Core Team",
    image: null,
    order: 3
  },
  // Faculty Coordinators
  {
    id: "4",
    name: "Dr. Selvam",
    role: "Faculty Coordinator",
    category: "Faculty Coordinators",
    image: null,
    order: 1
  },
  {
    id: "5",
    name: "Dr. Muthukumar",
    role: "Faculty Coordinator",
    category: "Faculty Coordinators",
    image: null,
    order: 2
  },
  {
    id: "6",
    name: "Dr. Balaji",
    role: "Faculty Coordinator",
    category: "Faculty Coordinators",
    image: null,
    order: 3
  },
  // Dance Club
  {
    id: "7",
    name: "Jervin J V",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Dance Club",
    image: null,
    order: 1
  },
  {
    id: "8",
    name: "Srimathi S",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Dance Club",
    image: null,
    order: 2
  },
  // Music Club
  {
    id: "9",
    name: "Sruthika K",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Music Club",
    image: null,
    order: 1
  },
  {
    id: "10",
    name: "Madhumitha B",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Music Club",
    image: null,
    order: 2
  },
  // Compering Club
  {
    id: "11",
    name: "Shivani A",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Compering Club",
    image: null,
    order: 1
  },
  {
    id: "12",
    name: "Thilakavathy P",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Compering Club",
    image: null,
    order: 2
  },
  // Media Club
  {
    id: "13",
    name: "Sai Santhosh P",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Media Club",
    image: null,
    order: 1
  },
  {
    id: "14",
    name: "Sanjay S",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Media Club",
    image: null,
    order: 2
  },
  // Tech Club
  {
    id: "15",
    name: "Yuva Shree M",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Tech Club",
    image: null,
    order: 1
  },
  {
    id: "16",
    name: "Kathir Vel S",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Tech Club",
    image: null,
    order: 2
  },
  // Fashion Club
  {
    id: "17",
    name: "Silvya E",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Fashion Club",
    image: null,
    order: 1
  },
  {
    id: "18",
    name: "Graciya Mariya J",
    role: "Secretary",
    category: "Student Coordinators",
    subCategory: "Fashion Club",
    image: null,
    order: 2
  }
];
