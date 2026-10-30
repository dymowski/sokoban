import type { LevelDef } from '../domain/level';

/**
 * Level pool (XSB format). Each level must pass the solver test in tests/unit/levels.test.ts
 * (solvable, ≥ 4 pushes) — otherwise make test-unit fails.
 */
export const LEVELS: readonly LevelDef[] = [
  {
    id: 'warm-up',
    name: 'Warm-up',
    map: `
#######
#  .  #
# $@$ #
#  .  #
#######
`,
  },
  {
    id: 'corridor',
    name: 'Corridor',
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
    id: 'two-rooms',
    name: 'Two rooms',
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
    id: 'warehouse',
    name: 'Warehouse',
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
    id: 'spiral',
    name: 'Spiral',
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
    id: 'bend',
    name: 'Bend',
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
    id: 'narrow-passage',
    name: 'Narrow passage',
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
    id: 'classroom',
    name: 'Classroom',
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
    id: 'stairs',
    name: 'Stairs',
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
    id: 'columns',
    name: 'Columns',
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
    id: 'maze',
    name: 'Maze',
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
    id: 'office',
    name: 'Office',
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
    id: 'long-corridor',
    name: 'Long corridor',
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
