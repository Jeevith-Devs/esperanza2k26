
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
  },
  // Vistara Club Members - Dance Club
  { id: "19", name: "Sarvesh", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 1 },
  { id: "20", name: "Yabesh", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 2 },
  { id: "21", name: "S. Mohana Priya", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 3 },
  { id: "22", name: "Rajalakshmi V", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 4 },
  { id: "23", name: "M. Aishwarya", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 5 },
  { id: "28", name: "Manikandan K", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 6 },
  { id: "24", name: "Sindhuja S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 7 },
  { id: "25", name: "Amirdhavarshini S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 8 },
  { id: "26", name: "Hariharan S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 9 },
  { id: "27", name: "Rakkesh S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 10 },
  { id: "29", name: "Sopan Babu S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 11 },
  { id: "30", name: "Santhosh R", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 12 },
  { id: "32", name: "Manoj K N", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 13 },
  { id: "31", name: "Yashwanth S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 14 },
  { id: "34", name: "Monisha G", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 15 },
  { id: "33", name: "Bhavana CP", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 16 },
  { id: "35", name: "Vaishali", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 17 },
  { id: "36", name: "Abinaya J", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 18 },
  { id: "37", name: "Dharun", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 19 },
  { id: "38", name: "Sangilidharan", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 20 },
  { id: "39", name: "Nithya Sri K M", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 21 },
  { id: "40", name: "Saiprithinga U S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 22 },
  { id: "41", name: "Kaviya", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 23 },
  { id: "42", name: "Kavinayaa R", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 24 },
  { id: "43", name: "Lakshitha P", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 25 },
  { id: "44", name: "Swetha S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 26 },
  { id: "45", name: "Karnika B", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 27 },
  { id: "46", name: "Prarthana Shree G", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 28 },
  { id: "47", name: "Dharani I", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 29 },
  { id: "48", name: "Ramya B", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 30 },
  { id: "49", name: "Poojith P", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 31 },
  { id: "50", name: "Nishanth M", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 32 },
  { id: "51", name: "Vishnuvaradhan", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 33 },
  { id: "52", name: "Hari Prasad S A", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 34 },
  { id: "53", name: "Malar A", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 35 },
  { id: "54", name: "Evangelin Pricy S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 36 },
  { id: "55", name: "Lakshitha S", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 37 },
  { id: "56", name: "Vishnuvaradhan", role: "Member", category: "Vistara Club Members", subCategory: "Dance Club", image: null, order: 38 },
  // Vistara Club Members - Music Club
  { id: "57", name: "Akash Kumar", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 1 },
  { id: "58", name: "Sashangan K. M", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 2 },
  { id: "59", name: "Gopal V N", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 3 },
  { id: "60", name: "Mahalakshmi", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 4 },
  { id: "61", name: "Darshan", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 5 },
  { id: "62", name: "Srinath", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 6 },
  { id: "63", name: "Akeesh", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 7 },
  { id: "64", name: "Sandeep", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 8 },
  { id: "65", name: "Persiyal", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 9 },
  { id: "66", name: "Guganesh", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 10 },
  { id: "67", name: "Rohan", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 11 },
  { id: "68", name: "Mrinalini", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 12 },
  { id: "69", name: "Souna", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 13 },
  { id: "70", name: "Vijay Santhosh G", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 14 },
  { id: "71", name: "Akshyaa A", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 15 },
  { id: "72", name: "Benito Kingsley R", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 16 },
  { id: "73", name: "Sanjith Suvan R", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 17 },
  { id: "74", name: "Sai Manasa C", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 18 },
  { id: "75", name: "A Sherley", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 19 },
  { id: "76", name: "Vel Vishal K", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 20 },
  { id: "77", name: "Dhanush Kumar R", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 21 },
  { id: "78", name: "Gracy T", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 22 },
  { id: "79", name: "Karthikeyan", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 23 },
  { id: "80", name: "Sibiah Fragrance S", role: "Member", category: "Vistara Club Members", subCategory: "Music Club", image: null, order: 24 },
  // Vistara Club Members - Compering Club
  { id: "81", name: "Meshach Sanderson C", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 1 },
  { id: "82", name: "Alvin", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 2 },
  { id: "83", name: "Afrudin", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 3 },
  { id: "84", name: "Janani B", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 4 },
  { id: "85", name: "Madhumitha", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 5 },
  { id: "86", name: "Chitra", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 6 },
  { id: "87", name: "Sanjuthan", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 7 },
  { id: "88", name: "Preethi", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 8 },
  { id: "89", name: "Abisek R", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 9 },
  { id: "90", name: "Thilagavathy AC", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 10 },
  { id: "91", name: "Vigneshwaran", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 11 },
  { id: "92", name: "Hari Krishna S K", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 12 },
  { id: "93", name: "Gokulnath D", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 13 },
  { id: "94", name: "Ukesh R", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 14 },
  { id: "95", name: "Asina Begum A", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 15 },
  { id: "96", name: "Mudhra S", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 16 },
  { id: "97", name: "Nithish Kumar S", role: "Member", category: "Vistara Club Members", subCategory: "Compering Club", image: null, order: 17 },
  // Vistara Club Members - Media Club
  { id: "98", name: "Ashvinth", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 1 },
  { id: "99", name: "Charukesh", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 2 },
  { id: "100", name: "Kavin Prasath G", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 3 },
  { id: "101", name: "Amith Y", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 4 },
  { id: "102", name: "Kabilan S", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 5 },
  { id: "103", name: "Akash B", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 6 },
  { id: "104", name: "Harini R", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 7 },
  { id: "105", name: "Harini Priya R", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 8 },
  { id: "106", name: "Dinesh V", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 9 },
  { id: "107", name: "Monish", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 10 },
  { id: "108", name: "Adhitya", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 11 },
  { id: "109", name: "Kebin", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 12 },
  { id: "110", name: "Abishek Sidharth", role: "Member", category: "Vistara Club Members", subCategory: "Media Club", image: null, order: 13 },
  // Vistara Club Members - Tech Club
  { id: "111", name: "Jeevith", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 1 },
  { id: "112", name: "Madhan Kumar V", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 2 },
  { id: "113", name: "Nandha Kumar V", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 3 },
  { id: "114", name: "Aadhira", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 4 },
  { id: "115", name: "Ranjith", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 5 },
  { id: "116", name: "Akash", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 6 },
  { id: "117", name: "Santhosh", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 7 },
  { id: "118", name: "Jerlin Jaspher", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 8 },
  { id: "119", name: "Arjun", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 9 },
  { id: "120", name: "Chezhiyan", role: "Member", category: "Vistara Club Members", subCategory: "Tech Club", image: null, order: 10 },
  // Vistara Club Members - Fashion Club
  { id: "121", name: "Yuvan Raj", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 1 },
  { id: "122", name: "Raheem M", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 2 },
  { id: "123", name: "Nivash R", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 3 },
  { id: "124", name: "G Akash Kumar", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 4 },
  { id: "125", name: "Sachin N", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 5 },
  { id: "126", name: "Arsath Ahamed S", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 6 },
  { id: "127", name: "Kamalesh R", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 7 },
  { id: "128", name: "Sanjay", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 8 },
  { id: "129", name: "Sentamizh", role: "Member", category: "Vistara Club Members", subCategory: "Fashion Club", image: null, order: 9 }
];
