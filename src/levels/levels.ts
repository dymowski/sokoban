import type { LevelDef } from '../domain/level';

/**
 * The levels in play order, from the easiest to the hardest (XSB format). Each one must pass the
 * solver test in tests/unit/levels.test.ts: solvable, ≥ 4 pushes, and the minimum number of pushes
 * never drops from one level to the next — otherwise make test-unit fails.
 */
export const LEVELS: readonly LevelDef[] = [
  {
    id: 'first-steps',
    name: 'First steps',
    map: `
#######
#@    #
# $   #
#     #
#   . #
#######
`,
  },
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
  {
    id: 'cellar',
    name: 'Cellar',
    map: `
######
#.   ##
# @ $.###
# $#  $ #
#  #   .#
#########
`,
  },
  {
    id: 'pantry',
    name: 'Pantry',
    map: `
#########
# .   $ #
#  #$#  #
#  $ # @#
##    . #
# . #  ##
#   ####
#####
`,
  },
  {
    id: 'attic',
    name: 'Attic',
    map: `
 ######
 #   .#
 # $  #
 ###  ###
### $#  #
#    $ @#
# .  .  #
#########
`,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    map: `
 ####
##  ###
# $ . #
# $#  #
#@   $#
##   .#
 ##. ##
  ####
`,
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    map: `
 ######
 #.  .#
 #  #$#
### $ #
#.$   #
#@ #  #
####  #
   ####
`,
  },
  {
    id: 'library',
    name: 'Library',
    map: `
#########
#.      #
#  #.#  #
#@$     #
###$ # ##
#   $  #
#  #  .#
########
`,
  },
  {
    id: 'boiler-room',
    name: 'Boiler room',
    map: `
  #######
### @#. #
# $ $   #
#  #  $ #
#   #. ##
#      #
##   . #
 #######
`,
  },
  {
    id: 'gallery',
    name: 'Gallery',
    map: `
 ######
##    #
# $# .#
#    .###
#@ #   .#
# $$ #  #
#   #####
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
    id: 'archive',
    name: 'Archive',
    map: `
 ####
##  #####
#   $@$ #
# $ ##  #
#.# #   #
#     . #
### .  ##
  ######
`,
  },
  {
    id: 'loading-dock',
    name: 'Loading dock',
    map: `
#######
#.   .#
# #   #
#    ###
#  .$  ##
#  # $  ##
#$$##   .#
# @####  #
####  ####
`,
  },
  {
    id: 'bakery',
    name: 'Bakery',
    map: `
      ####
      #  #
  ##### .#
 ##. ##. #
## $    .#
# $  $   #
# $#  #  #
#@ #######
####
`,
  },
  {
    id: 'chapel',
    name: 'Chapel',
    map: `
#########
#.      #
#. #$#$ #
#  # @$.#
#    #$##
#      #
###. ###
  ####
`,
  },
  {
    id: 'mill',
    name: 'Mill',
    map: `
 #######
 # $ ..#
## # @ #
#  .# .#
#    $ #
##$ $ ##
 #  ###
 ####
`,
  },
  {
    id: 'harbor',
    name: 'Harbor',
    map: `
     #####
     #   #
  ####@  #
###  #.$##
#.    $ #
# $ $ # #
#. #  . #
#########
`,
  },
  {
    id: 'granary',
    name: 'Granary',
    map: `
  ####
###  #
# $  #####
# #  #   #
#  + .$. #
##   # $##
 #  ## $ #
 #. ##   #
 #########
`,
  },
  {
    id: 'foundry',
    name: 'Foundry',
    map: `
#####
#   #####
#   $+$ #
##$  #. #
#  ##.  #
#  $    #
#    # .#
#########
`,
  },
  {
    id: 'cloister',
    name: 'Cloister',
    map: `
#####
#   #
# $$#####
# #  # .##
# # $.. @#
# # $#   #
#  $  #  #
#  . .####
#######
`,
  },
  {
    id: 'observatory',
    name: 'Observatory',
    map: `
########
#  #   ####
# $ $#  . #
#       . #
### #$ #.##
 #. #     #
 #$$###  .#
 # @# #####
 ####
`,
  },
  {
    id: 'engine-room',
    name: 'Engine room',
    map: `
###########
#     .$ .#
# # #$$@ .#
#   # #####
# $ $  ###
#####. $ #
    #. . #
    ######
`,
  },
  {
    id: 'catacombs',
    name: 'Catacombs',
    map: `
 #########
##  ..  .#
# $#$#   #
#    ## .#
###$ ### #
 # .$    #
 #@$## # #
 #  ##   #
 #########
`,
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    map: `
########
#      ###
#    .   ##
# # ## #  #
#      $ $#
#    ##  .#
#.#.$### ##
#    # $$#
## .## @ #
 #########
`,
  },
  {
    id: 'labyrinth',
    name: 'Labyrinth',
    map: `
    ####
 ####  #
 # $ . ###
 # $ #   #
## $##   #
# $..#  ###
#@   $$ ..#
###### .  #
     ######
`,
  },
  {
    id: 'vault',
    name: 'Vault',
    map: `
####
# .####
#  #  #####
# .$.  #  #
#@.#      #
#   $ #   #
### $ $$# #
  #####  .#
      #####
`,
  },
  {
    id: 'clock-tower',
    name: 'Clock tower',
    map: `
    ######
   ##    #
#### . $ ##
# $ $$ #  #
#   $@##  #
#  ### . ##
#  ##.  ##
#  .   .#
####   ##
   #####
`,
  },
  {
    id: 'crossroads',
    name: 'Crossroads',
    map: `
       ####
       #  ##
     ### . #
    ## .  .#
#####   #  #
#. ## $ $ ##
# $ # $# ##
#@$.  . $#
#  ###   #
#### #####
`,
  },
  {
    id: 'citadel',
    name: 'Citadel',
    map: `
 ######
## .  #
# $ $ ######
#  #  ##   #
##    ## . #
 # $ ####  #
 #$#$   .  #
 #@$.   ..##
 ###  #####
   ####
`,
  },
];
