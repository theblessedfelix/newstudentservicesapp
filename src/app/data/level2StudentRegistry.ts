type ScannerStudent = {
  id: string;
  studentId: string;
  name: string;
  initials: string;
};

export const LEVEL2_STUDENT_NAME_BY_ID: Record<string, string> = {
  '3514': 'Lawrence Idiakhoa',
  '9819': 'Ofukwu Matthew',
  '11540': 'Oluwatoyin Olaiya',
  '12613': 'Level 2 Student 12613',
  '15042': 'Level 2 Student 15042',
  '15290': 'Level 2 Student 15290',
  '15355': 'Oyenike Atoyebi',
  '15744': 'Lara Odebiyi',
  '15749': 'Temitope Edun',
  '15847': 'Ntia James',
  '16034': 'Level 2 Student 16034',
  '16031': 'Emmanuella Obumaese',
  '16046': 'Level 2 Student 16046',
  '18502': 'Level 2 Student 18502',
  '18782': 'Oghenechovwe Erhisere',
  '18783': 'Stephenie Uche',
  '18784': 'Abayomi Taiwo',
  '18793': 'Adebola Awelewa',
  '18795': 'Adaora Ojukwu',
  '18808': 'Olasubomi Solanke',
  '18853': 'Roseline Akpovbovbo',
  '18855': 'HILDA WODI',
  '18856': 'Chinomnso Onwubiko',
  '18892': 'Immanuella Money-Oj',
  '18893': 'Usoko Dawel',
  '18982': 'Ifeanyi Chukwuani',
  '19024': 'Felix Patrick',
  '19088': 'Blissful Ekwoson',
  '19418': 'Adekunle Fasasi',
  '19422': 'Cornell Umogbai',
  '19427': 'Emon Adejobi',
  '19428': 'Omolola Johnson',
  '19438': 'Melford Graham-Briggs',
  '19448': 'Rebecca Efetie',
  '19450': 'Chidinma Abengowe',
  '19466': 'Becky Ariole',
  '19470': 'Cecilia LAYIWOLA',
  '19761': 'Jeremiah Adewale',
  '19763': 'Adim isiakpona',
  '19764': 'Nkem Isiakpona',
  '19771': 'Olufunmilola Omisore',
  '19781': 'Olusegun Erinle',
  '19880': 'Oladimeji Sanyaolu',
  '19967': 'Tony Nwajei',
  '19984': 'Francisca Olasebikan',
  '20005': 'Gift Omokor',
  '20053': 'Stanley Onyezi',
  '20054': 'oluwaseun obadan',
  '20055': 'Modupeola Jackson',
  '20093': 'Eseoghene Odije',
  '20144': 'COLLINS OJONG',
  '20145': 'Level 2 Student 20145',
  '20146': 'Ibraheem Asade',
  '20149': 'OKEKE ELEM',
  '20182': 'Funmilayo Nwanguma',
  '20224': 'Anthony Iroegbu',
  '20316': 'Dorothy Malike',
  '20347': 'Elvis Ihekwoaba',
  '20741': 'Morgan Anthony',
  '20868': 'Ayokunle Omoniyi',
  '21131': 'Ogechi Osuagwu',
  '21854': 'IFEANYI OTI',
  '22464': 'Modupe Lawal',
  '22467': 'Level 2 Student 22467',
  '23378': 'Level 2 Student 23378',
};

export const LEVEL2_STUDENT_IDS = Object.keys(LEVEL2_STUDENT_NAME_BY_ID);
export const LEVEL2_STUDENT_ID_SET = new Set(LEVEL2_STUDENT_IDS);

function toInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3);
}

export function getLevel2ScannerStudents(): ScannerStudent[] {
  return LEVEL2_STUDENT_IDS.map((studentId) => {
    const name = LEVEL2_STUDENT_NAME_BY_ID[studentId];
    return {
      id: studentId,
      studentId,
      name,
      initials: toInitials(name),
    };
  });
}
