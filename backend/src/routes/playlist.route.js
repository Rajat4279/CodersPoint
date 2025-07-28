import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.middleware.js";

// create router
const router = express.Router();

// import controllers
import {
    getAllListDetails,
    getPlaylistDetails,
    createPlaylist,
    addProblemToPlaylist,
    deletePlaylist,
    deleteProblemFromPlaylist,
} from "../controllers/playlist.controller.js";

// create routes
router.route("/").get(isLoggedIn, getAllListDetails);
router.route("/:playlistId").get(isLoggedIn, getPlaylistDetails);
router.route("/create-playlist").post(isLoggedIn, createPlaylist);
router.route("/:playlistId/add-problem").post(isLoggedIn, addProblemToPlaylist);
router.route("/:playlistId").delete(isLoggedIn, deletePlaylist);
router
    .route("/:playlistId/remove-problem")
    .delete(isLoggedIn, deleteProblemFromPlaylist);

// export router
export default router;
