'use strict';

const fs = require('fs-extra');
const keyBy = require('lodash/keyBy');

module.exports = async ({
  followedDbPath,
  unfollowedDbPath,
  likedPhotosDbPath,
  nofollowedDbPath,

  logger = console,
}) => {
  let prevFollowedUsers = {};
  let prevUnfollowedUsers = {};
  let prevLikedPhotos = [];
  let prevNofollowedUsers = [];

  async function trySaveDb() {
    try {
      await fs.writeFile(followedDbPath, JSON.stringify(Object.values(prevFollowedUsers)));
      await fs.writeFile(unfollowedDbPath, JSON.stringify(Object.values(prevUnfollowedUsers)));
      await fs.writeFile(likedPhotosDbPath, JSON.stringify(prevLikedPhotos));
      await fs.writeFile(nofollowedDbPath, JSON.stringify(prevNofollowedUsers));
    } catch (err) {
      logger.error('Failed to save database');
    }
  }

  async function tryLoadDb() {
    try {
      prevFollowedUsers = keyBy(JSON.parse(await fs.readFile(followedDbPath)), 'username');
    } catch (err) {
      logger.warn('No followed database found');
    }
    try {
      prevUnfollowedUsers = keyBy(JSON.parse(await fs.readFile(unfollowedDbPath)), 'username');
    } catch (err) {
      logger.warn('No unfollowed database found');
    }
    try {
      prevLikedPhotos = JSON.parse(await fs.readFile(likedPhotosDbPath));
    } catch (err) {
      logger.warn('No likes database found');
    }
    try {
      prevNofollowedUsers = keyBy(JSON.parse(await fs.readFile(prevNofollowedUsers)), 'username');
    } catch (err) {
      logger.warn('No no-follow database found');
    }
  }

  function getPrevLikedPhotos() {
    return prevLikedPhotos;
  }

  function getTotalLikedPhotos() {
    return getPrevLikedPhotos().length; // TODO performance
  }

  function getLikedPhotosLastTimeUnit(timeUnit) {
    const now = new Date().getTime();
    return getPrevLikedPhotos().filter(u => now - u.time < timeUnit);
  }

  async function addLikedPhoto({ username, href, time }) {
    prevLikedPhotos.push({ username, href, time });
    await trySaveDb();
  }

  function getPrevFollowedUsers() {
    return Object.values(prevFollowedUsers);
  }

  function getTotalFollowedUsers() {
    return getPrevFollowedUsers().length; // TODO performance
  }

  function getFollowedLastTimeUnit(timeUnit) {
    const now = new Date().getTime();
    return getPrevFollowedUsers().filter(u => now - u.time < timeUnit);
  }

  function getPrevFollowedUser(username) {
    return prevFollowedUsers[username];
  }

  async function addPrevFollowedUser(user) {
    prevFollowedUsers[user.username] = user;
    await trySaveDb();
  }

  function getPrevUnfollowedUsers() {
    return Object.values(prevUnfollowedUsers);
  }

  function getTotalUnfollowedUsers() {
    return getPrevUnfollowedUsers().length; // TODO performance
  }

  function getUnfollowedLastTimeUnit(timeUnit) {
    const now = new Date().getTime();
    return getPrevUnfollowedUsers().filter(u => now - u.time < timeUnit);
  }

  async function addPrevUnfollowedUser(user) {
    prevUnfollowedUsers[user.username] = user;
    await trySaveDb();
  }
  function getPrevNofollowedUsers() {
    return Object.values(prevNofollowedUsers);
  }

  function getTotalNofollowedUsers() {
    return getPrevNofollowedUsers().length; // TODO performance
  }

  function getNofollowedLastTimeUnit(timeUnit) {
    const now = new Date().getTime();
    return getPrevNofollowedUsers().filter(u => now - u.time < timeUnit);
  }

  async function addPrevNofollowedUser(user) {
    prevNofollowedUsers[user.username] = user;
    await trySaveDb();
  }

  await tryLoadDb();

  return {
    save: trySaveDb,
    getPrevFollowedUser,
    getPrevFollowedUsers,
    addPrevFollowedUser,
    addPrevUnfollowedUser,
    addPrevNofollowedUser,
    getPrevUnfollowedUsers,
    getFollowedLastTimeUnit,
    getPrevNofollowedUsers,
    getTotalNofollowedUsers,
    getUnfollowedLastTimeUnit,
    getPrevLikedPhotos,
    getLikedPhotosLastTimeUnit,
    addLikedPhoto,
    getTotalFollowedUsers,
    getTotalUnfollowedUsers,
    getTotalLikedPhotos,
    getNofollowedLastTimeUnit,
  };
};
