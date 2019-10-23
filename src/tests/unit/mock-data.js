const fakeBaseUrl = 'v2';

const singleResult = {
  testCase: 'fakeId',
  expectedResult: {},
  description: 'fulfilled with a single result',
};
const multiResult = {
  testCase: { firstName: 'fakeName' },
  expectedResult: [],
  description: 'fulfilled with multiple results',
};
const noQueryParams = {
  testCase: {},
  description: 'return undefined when no query parameters are passed',
};
const people = [
  {
    id: '1111',
    firstName: 'Benny',
    lastName: 'Beaver',
    primaryAffiliation: 'Student',
  },
  {
    id: '2222',
    firstName: 'Donald',
    lastName: 'Duck',
    primaryAffiliation: 'Student',
  },
  {
    id: '3333',
    firstName: 'Sally',
    lastName: 'Seal',
    primaryAffiliation: 'Student',
  },
];
const rawDirectories = [
  {
    dn: 'osuuid=12345678910,ou=people,o=orst.edu',
    controls: [],
    osuOfficeAddress:
      'Horticulture$USDA-ARS (HCRL)$3420 NW Orchard Ave$Corvallis, OR 97330-5014',
    postalAddress:
      'Horticulture$Oregon State University$4017 Ag and Life Science Bldg$Corvallis, OR 97331-8646',
    mail: 'guy@oregonstate.edu',
    osuDepartment: 'Horticulture',
    title: 'Courtesy Appointment',
    facsimileTelephoneNumber: '1 541 867 5309',
    telephoneNumber: '1 541 867 5309',
    sn: 'Guy',
    cn: 'Guy, Just A',
    givenName: 'Just',
    objectClass: [
      'top',
      'person',
      'OrganizationalPerson',
      'inetOrgPerson',
      'posixAccount',
      'osuPerson',
      'shadowAccount',
      'lpSghePerson',
      'googlePerson',
      'eduPerson',
    ],
    uid: 'aguy',
    osuUID: '12345678910',
    osuPrimaryAffiliation: 'E',
  },
  {
    dn: 'osuuid=12345678911,ou=people,o=orst.edu',
    controls: [],
    osuOfficeAddress:
      'Horticulture$USDA-ARS (HCRL)$3420 NW Orchard Ave$Corvallis, OR 97330-5014',
    postalAddress:
      'Horticulture$Oregon State University$4017 Ag and Life Science Bldg$Corvallis, OR 97331-8646',
    mail: 'anotherguy@oregonstate.edu',
    osuDepartment: 'Horticulture',
    title: 'Courtesy Appointment',
    facsimileTelephoneNumber: '1 541 867 5309',
    telephoneNumber: '1 541 867 5309',
    sn: 'Guy',
    cn: 'Guy, A Different',
    givenName: 'A',
    objectClass: [
      'top',
      'person',
      'OrganizationalPerson',
      'inetOrgPerson',
      'posixAccount',
      'osuPerson',
      'shadowAccount',
      'lpSghePerson',
      'googlePerson',
      'eduPerson',
    ],
    uid: 'adiffguy',
    osuUID: '12345678911',
    osuPrimaryAffiliation: 'E',
  },
];

const expectedSerializedDirectories = {
  links: {
    self: '/v2/directory?page[number]=1&page[size]=2',
    first: '/v2/directory?page[number]=1&page[size]=2',
    last: '/v2/directory?page[number]=1&page[size]=2',
    next: null,
    prev: null,
  },
  meta: {
    totalResults: 2,
    totalPages: 1,
    currentPageNumber: 1,
    currentPageSize: 2,
  },
  data: [
    {
      type: 'directory',
      id: '12345678910',
      links: {
        self: '/v2/directory/12345678910',
      },
      attributes: {
        firstName: 'Just',
        lastName: 'Guy',
        fullName: 'Guy, Just A',
        primaryAffiliation: 'Employee',
        jobTitle: 'Courtesy Appointment',
        department: 'Horticulture',
        departmentMailingAddress:
          'Horticulture, Oregon State University, 4017 Ag and Life Science Bldg, Corvallis, OR 97331-8646',
        officePhoneNumber: '+1 541 867 5309',
        officeAddress:
          'Horticulture, USDA-ARS (HCRL), 3420 NW Orchard Ave, Corvallis, OR 97330-5014',
        faxNumber: '+1 541 867 5309',
        emailAddress: 'guy@oregonstate.edu',
        username: 'aguy',
        osuUid: '12345678910',
      },
    },
    {
      type: 'directory',
      id: '12345678911',
      links: {
        self: '/v2/directory/12345678911',
      },
      attributes: {
        firstName: 'A',
        lastName: 'Guy',
        fullName: 'Guy, A Different',
        primaryAffiliation: 'Employee',
        jobTitle: 'Courtesy Appointment',
        department: 'Horticulture',
        departmentMailingAddress:
          'Horticulture, Oregon State University, 4017 Ag and Life Science Bldg, Corvallis, OR 97331-8646',
        officePhoneNumber: '+1 541 867 5309',
        officeAddress:
          'Horticulture, USDA-ARS (HCRL), 3420 NW Orchard Ave, Corvallis, OR 97330-5014',
        faxNumber: '+1 541 867 5309',
        emailAddress: 'anotherguy@oregonstate.edu',
        username: 'adiffguy',
        osuUid: '12345678911',
      },
    },
  ],
};

const expectedSerializedDirectory = {
  links: {
    self: undefined,
  },
  data: expectedSerializedDirectories.data[0],
};

export {
  singleResult,
  multiResult,
  noQueryParams,
  people,
  rawDirectories,
  expectedSerializedDirectory,
  expectedSerializedDirectories,
  fakeBaseUrl,
};
