#ifndef SECRET_H
#define SECRET_H

//zapsat zvlášt po dvoujcích (0x--)
//little endian
static const PROGMEM u1_t NWKSKEY[16] = { 0x95CF576681B44745A5C97647F1947CEA };
//zapsat zvlášt po dvoujcích (0x--)
//little endian
static const u1_t PROGMEM APPSKEY[16] = { 0x5D2F686946105C875964E19B1BE35C54  };
//zapsat jako 0x a číslo
//big endian
static const u4_t DEVADDR =  0x260BB40D;


#endif
