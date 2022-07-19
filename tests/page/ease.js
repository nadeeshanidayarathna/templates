function executeTests(line) {
    {
        // root+content test
        console.log(line);
        if (document.querySelectorAll(".ease-root").length != 1) {
            throw "[TEST]:root exists test - failed!!! please check the build HTML root div exists.";
        } else {
            console.log("[TEST]:root exists test - success!");
        }

        console.log(line);
        if (document.querySelectorAll(".ease-root")[0].querySelectorAll(".level1").length != 1) {
            throw "[TEST]:root level test - failed!!! please check the build HTML root -> level1 div exists.";
        } else {
            console.log("[TEST]:root level test - success!");
        }

        console.log(line);
        if (document.querySelectorAll(".ease-root")[0].querySelectorAll(".level2,.level3,.level4,.level5,.level6,.level7,.level8,.level9,.level10").length != 0) {
            throw "[TEST]:root level test - failed!!! please check the build HTML root -> level 2-9 div exists which is wrong.";
        } else {
            console.log("[TEST]:root level test - success!");
        }

        console.log(line);
        if (document.querySelectorAll(".ease-content").length != 1) {
            throw "[TEST]:content exists test - failed!!! please check the build HTML content div exists.";
        } else {
            console.log("[TEST]:content exists test - success!");
        }

        // level test
        const levels = document.querySelectorAll(".level1,.level2,.level3,.level4,.level5,.level6,.level7,.level8,.level9,.level10");
        var levelNumbers = [];
        var levelTextIssue = false;
        for (const level of levels) {
            if (level.textContent.trim() == "") {
                // levelTextIssue = true;
                level.remove();
            }
            levelNumbers.push(Number(level.className.replaceAll("level", "")));
        }
        var previousLevelNumber = 0;
        var levelOrderIssue = false;
        for (const levelNumber of levelNumbers) {
            if (levelNumber > previousLevelNumber + 1) {
                levelOrderIssue = true;
                break;
            }
            previousLevelNumber = levelNumber;
        }
        // console.log(line);
        // if (levelTextIssue) {
        //     throw "[TEST]:level text test - failed!!! please check the build HTML level(s) contains empty text.";
        // } else {
        //     console.log("[TEST]:level text test - success!");
        // }
        console.log(line);
        if (levelOrderIssue) {
            throw "[TEST]:level order test - failed!!! please check the build HTML level order.";
        } else {
            console.log("[TEST]:level order test - success!");
        }
    }

    {
        // image test
        const images = document.querySelectorAll("img");
        var imagePathIssue = false;
        var imageIssueCount = 0;
        for (const image of images) {
            if (!(image.src.toUpperCase().startsWith("HTTP") || image.src.toUpperCase().startsWith("DATA:IMAGE"))) {
                console.log("image src issue found src:" + image.src.substring(0, 100) + " html:" + image.outerHTML.substring(0, 100));
                imagePathIssue = true;
                imageIssueCount++;
            }
        }
        console.log(line);
        if (imagePathIssue) {
            throw "[TEST]:image path test - failed!!! for " + imageIssueCount + " image(s). please check the build HTML image src whether its an absolute link or base64.";
        } else {
            console.log("[TEST]:image path test - success!");
        }
    }

    // {
    //     // anchor test
    //     const anchors = document.querySelectorAll("a[href]");
    //     var anchorPathIssue = false;
    //     var anchorIssueCount = 0;
    //     for (const anchor of anchors) {
    //         if (!anchor.href.toUpperCase().startsWith("HTTP")) {
    //             console.log("anchor href issue found href:" + anchor.href.substring(0, 100) + " html:" + anchor.outerHTML.substring(0, 100));
    //             anchorPathIssue = true;
    //             anchorIssueCount++;
    //         }
    //     }
    //     console.log(line);
    //     if (anchorPathIssue) {
    //         throw "[TEST]:anchor path test - failed!!! for " + anchorIssueCount + " anchor(s). please check the build HTML anchor href whether its an absolute link.";
    //     } else {
    //         console.log("[TEST]:anchor path test - success!");
    //     }
    // }

    {
        console.log(line);
        console.log("[LEVEL SUMMARY] ease-root count:" + document.querySelectorAll(".ease-root").length);
        console.log("[LEVEL SUMMARY] ease-content count:" + document.querySelectorAll(".ease-content").length);
        const issueDateCount = document.querySelectorAll(".issue-date").length;
        if (issueDateCount > 0) {
            console.log("[LEVEL SUMMARY] issue-date count:" + issueDateCount);
        }
        const effectiveDateCount = document.querySelectorAll(".effective-date").length;
        if (effectiveDateCount > 0) {
            console.log("[LEVEL SUMMARY] effective-date count:" + effectiveDateCount);
        }
        console.log("[LEVEL SUMMARY] level1 count:" + document.querySelectorAll(".level1").length);
        const level2Count = document.querySelectorAll(".level2").length;
        if (level2Count > 0) {
            console.log("[LEVEL SUMMARY] level2 count:" + level2Count);
        }
        const level3Count = document.querySelectorAll(".level3").length;
        if (level3Count > 0) {
            console.log("[LEVEL SUMMARY] level3 count:" + level3Count);
        }
        const level4Count = document.querySelectorAll(".level4").length;
        if (level4Count > 0) {
            console.log("[LEVEL SUMMARY] level4 count:" + level4Count);
        }
        const level5Count = document.querySelectorAll(".level5").length;
        if (level5Count > 0) {
            console.log("[LEVEL SUMMARY] level5 count:" + level5Count);
        }
        const level6Count = document.querySelectorAll(".level6").length;
        if (level6Count > 0) {
            console.log("[LEVEL SUMMARY] level6 count:" + level6Count);
        }
        const level7Count = document.querySelectorAll(".level7").length;
        if (level7Count > 0) {
            console.log("[LEVEL SUMMARY] level7 count:" + level7Count);
        }
        const level8Count = document.querySelectorAll(".level8").length;
        if (level8Count > 0) {
            console.log("[LEVEL SUMMARY] level8 count:" + level8Count);
        }
        const level9Count = document.querySelectorAll(".level9").length;
        if (level9Count > 0) {
            console.log("[LEVEL SUMMARY] level9 count:" + level9Count);
        }
        const footnoteCount = document.querySelectorAll(".footnote").length;
        if (footnoteCount > 0) {
            console.log("[LEVEL SUMMARY] footnote count:" + footnoteCount);
        }
        console.log(line);
    }
}