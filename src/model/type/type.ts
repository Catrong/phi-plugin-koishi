export type idString = string & { readonly brand: unique symbol }

export type songString = string & { readonly brand: unique symbol }

export type levelKind = 'EZ' | 'HD' | 'IN' | 'AT' | 'LEGACY'

export type noteKind = 'tap' | 'drag' | 'hold' | 'flick' 

export type tplName =
    'arcgrosB19' |
    'song' |
    'b19' |
    'chap' |
    'clg' |
    'guess' |
    'help' |
    'ill' |
    'jrrp' |
    'list' |
    'lvsco' |
    'rand' |
    'rankingList' |
    'score' |
    'setting' |
    'tasks' |
    'update' |
    'userinfo'

export type allFnc =
    'help' |
    'tkhelp' |
    'bind' |
    'unbind' |
    'b19' |
    'arcgrosB19' |
    'update' |
    'info' |
    'list' |
    'singlescore' |
    'lvscore' |
    'chap' |
    'suggest' |
    'bestn' |
    'data' |
    'song' |
    'ill' |
    'search' |
    'alias' |
    'randmic' |
    'rankList' |
    'godList' |
    'randClg' |
    'comrks' |
    'tips' |
    'lmtAcc' |
    'new' |
    'tipgame' |
    'guessgame' |
    'ltrgame' |
    'sign' |
    'send' |
    'tasks' |
    'retask' |
    'jrrp' |
    'theme' |
    'dan' |
    'danupdate'