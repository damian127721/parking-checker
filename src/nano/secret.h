#ifndef SECRET_H
#define SECRET_H

//zapsat zvlášt po dvoujcích (0x--)
//little endian
static const PROGMEM u1_t NWKSKEY[16] = { 0xC8, 0xBA, 0x34, 0xEA, 0xB6, 0x07, 0x71, 0x9D, 0x6C, 0x79, 0x4F, 0xF9, 0xC3, 0x4C, 0x92, 0x6A };
//zapsat zvlášt po dvoujcích (0x--)
//little endian
static const u1_t PROGMEM APPSKEY[16] = { 0xBD, 0xAB, 0xE9, 0xAE, 0x1E, 0x62, 0x7D, 0x82, 0xDA, 0x74, 0xDF, 0x68, 0x58, 0xE8, 0x28, 0xC3 };
//zapsat jako 0x a číslo
//big endian
static const u4_t DEVADDR = 0x260BBF44 ;


#endif
