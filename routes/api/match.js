const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const words = require('../../task/words.json');
const scores = require('../../task/scores.json');

function countChar(str) {
    let myObj = {};
    for (let s of str) {
        if (myObj[s]) {
            myObj[s]++
        } else {
            myObj[s] = 1
        }
    }
    return myObj;
}

function checkOccurrences(inputOne, inputTwo) {
    const inputOneChars = countChar(inputOne);
    const inputTwoChars = countChar(inputTwo);
    if(inputOne.length > inputTwo.length){
        return false;
    }
    for (let s of inputTwo) {
        if (inputOneChars[s] !== inputTwoChars[s]) {
            return false;
        }
    }
    return true;
}

function calculateScore(word) {
    const wordChars = countChar(word)
    let score = 0;
    for (let letters of scores) {
        if (wordChars[letters.letter.toLowerCase()]) {
            if (wordChars[letters.letter.toLowerCase()] === letters.count) {
                score += letters.value;
            }
        }
    }
    return score;
}

// @route    POST api/match
// @desc     find matches for single word
router.post(
    '/',
    [
        check('word', 'Please include a valid string without numbers').isString(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        let {word} = req.body;
        word = word.toLowerCase();
        const regex = new RegExp(`^[${word}]+$`)
        const matches = words
            .filter((w) => regex.test(w))
            .filter((w) => checkOccurrences(w, word))
            .map((w) => ({word: w, score: calculateScore(w)}))
            .sort((a,b) => (a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0))
        try {
            res.status(201).json({
                success: true,
                word: word,
                matches: matches,
                count: matches.length,
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
