import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './challenges/challenge.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.challengeRepository.count();
    if (count > 0) {
      console.log('Database already seeded, skipping.');
      return;
    }

    const challenges = [
      {
        title: 'Two Sum',
        description:
          'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
        difficulty: 'easy',
        category: 'algorithms',
        starterCode: `function twoSum(nums, target) {\n  // Your code here\n}`,
        testCases: JSON.stringify([
          { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
          { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        ]),
      },
      {
        title: 'Palindrome Check',
        description:
          'Given a string, determine if it is a palindrome. A palindrome is a word that reads the same forwards and backwards.',
        difficulty: 'easy',
        category: 'strings',
        starterCode: `function isPalindrome(s) {\n  // Your code here\n}`,
        testCases: JSON.stringify([
          { input: { s: 'racecar' }, expected: true },
          { input: { s: 'hello' }, expected: false },
        ]),
      },
      {
        title: 'Binary Search',
        description:
          'Implement binary search to find the index of a target value in a sorted array. Return -1 if not found.',
        difficulty: 'medium',
        category: 'algorithms',
        starterCode: `function binarySearch(nums, target) {\n  // Your code here\n}`,
        testCases: JSON.stringify([
          { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
          { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 },
        ]),
      },
      {
        title: 'Quick Sort',
        description:
          'Implement the quicksort algorithm to sort an array of numbers in ascending order.',
        difficulty: 'medium',
        category: 'sorting',
        starterCode: `function quickSort(arr) {\n  // Your code here\n}`,
        testCases: JSON.stringify([
          { input: { arr: [3, 6, 8, 10, 1, 2, 1] }, expected: [1, 1, 2, 3, 6, 8, 10] },
          { input: { arr: [5, 4, 3, 2, 1] }, expected: [1, 2, 3, 4, 5] },
        ]),
      },
      {
        title: 'LRU Cache',
        description:
          'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        difficulty: 'hard',
        category: 'data-structures',
        starterCode: `class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n\n  get(key) {\n    // Your code here\n  }\n\n  put(key, value) {\n    // Your code here\n  }\n}`,
        testCases: JSON.stringify([
          {
            input: {
              operations: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
              args: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
            },
            expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
          },
        ]),
      },
      {
        title: 'Regex Engine',
        description:
          'Implement a simple regular expression engine that supports . and * wildcards.',
        difficulty: 'hard',
        category: 'strings',
        starterCode: `function isMatch(s, p) {\n  // Implement regex matching with support for '.' and '*'\n  // '.' matches any single character\n  // '*' matches zero or more of the preceding element\n  // Your code here\n}`,
        testCases: JSON.stringify([
          { input: { s: 'aa', p: 'a' }, expected: false },
          { input: { s: 'aa', p: 'a*' }, expected: true },
          { input: { s: 'ab', p: '.*' }, expected: true },
        ]),
      },
    ];

    for (const challengeData of challenges) {
      const challenge = this.challengeRepository.create(challengeData);
      await this.challengeRepository.save(challenge);
    }

    console.log(`Seeded ${challenges.length} challenges successfully.`);
  }
}
