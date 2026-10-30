import type { LevelDef } from '../domain/level';

/**
 * Pula plansz (format XSB). Każda musi przejść test solvera w tests/unit/levels.test.ts
 * (rozwiązywalna, ≥ 4 pchnięcia) — inaczej make test-unit pada.
 */
export const LEVELS: readonly LevelDef[] = [
  {
    id: 'rozgrzewka',
    name: 'Rozgrzewka',
    map: `
#######
#  .  #
# $@$ #
#  .  #
#######
`,
  },
  {
    id: 'korytarz',
    name: 'Korytarz',
    map: `
########
#      #
# $ $ .#
#@ ##  #
#  ## .#
########
`,
  },
  {
    id: 'dwa-pokoje',
    name: 'Dwa pokoje',
    map: `
#########
#       #
# $   $ #
#  #.#  #
##  .  ##
 # @   #
 #######
`,
  },
  {
    id: 'magazyn',
    name: 'Magazyn',
    map: `
 ######
 #    ###
##$##   #
#  $  $ #
# .#.  .#
#   ##@ #
#########
`,
  },
  {
    id: 'spirala',
    name: 'Spirala',
    map: `
  ######
  #    #
###$## #
#  . $ #
# #.$  #
#@  .  #
########
`,
  },
  {
    id: 'zakret',
    name: 'Zakręt',
    map: `
  #####
###   #
# $ $ #
# #.  ##
#  .$  #
##@ #.##
 #   #
 #####
`,
  },
  {
    id: 'waskie-przejscie',
    name: 'Wąskie przejście',
    map: `
########
#..    #
#..  $ #
###  $ #
  # $$ #
  #  @ #
  ######
`,
  },
  {
    id: 'klasa',
    name: 'Klasa',
    map: `
#########
#.  #  .#
# $   $ #
#  ###  #
# $   $ #
#.  @  .#
#########
`,
  },
  {
    id: 'schody',
    name: 'Schody',
    map: `
######
#@   #
# $$ ##
##  . #
 # $ .#
 #.   #
 ######
`,
  },
  {
    id: 'kolumny',
    name: 'Kolumny',
    map: `
#########
#   .   #
# #$#$# #
#.  @  .#
# #$#$# #
#   .   #
#########
`,
  },
  {
    id: 'labirynt',
    name: 'Labirynt',
    map: `
##########
#   #    #
# $ $  # #
#  ##.  .#
## #  $  #
#. @ ### #
#  #     #
##########
`,
  },
  {
    id: 'biuro',
    name: 'Biuro',
    map: `
########
#  #   #
# $  $ #
#.##.# #
#  $  .#
## @ ###
 #####
`,
  },
  {
    id: 'dlugi-korytarz',
    name: 'Długi korytarz',
    map: `
###########
#         #
#@$ $ #$  #
### # #   #
#.  .  .  #
###########
`,
  },
];
