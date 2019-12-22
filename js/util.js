"use strict";

const Util = {
    split: (s, d = '\n') => !s || s.trim() === '' ? [] : s.trim().split(d).map(i => i.trim().toLowerCase()).sort(),
    join: (a, d = '\n') => Array.isArray(a) ? a.filter(i => i && i.trim() !== '').join(d).toLowerCase() : ''
};