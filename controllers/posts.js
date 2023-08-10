var jwt = require("jsonwebtoken");
var connection = require("../config/db");
var constants = require("../config/constants");

var { save, findByIdAndUpdate } = require("../helpers/helper");
var multer = require("multer");
const path = require("path");
const fs = require("fs");
const e = require("cors");

var a =
  "CASE WHEN users.profile_picture IS NOT NULL THEN CONCAT('" +
  constants.BASE_URL +
  "images/profiles/',users.profile_picture)  ELSE '' END AS profile_picture";

exports.new = async function (req, res) {
  console.log("dddd",req)
  try {
    userPost = {
      user_id: req.body.login_user_id,
      post_type:1,
      description: req.body.description,
      visibilitySelectUsers: req.body.visibilitySelectUsers
        ? req.body.visibilitySelectUsers
        : 0,
    };
    if (req.file && req.file.filename != "" && req.file.filename != undefined) {
      userPost.image = req.file.filename;
      // console.log("jay shree ram");
    }

    var c = await save("events", userPost);
    console.log("c====", c);
    if (c) {
      if (req.body.visibilitySelectUsers != 1) {
        var visibility_data={};
        visibility_data.post_id = c;
        visibility_data.user_id = req.body.user_id;
        visibility_data.visibilitySelectUsers = req.body.visibilitySelectUsers;
        await visibility(visibility_data);
      }
      return res.json({ success: true, message: "Feed created." });
    }
    
  } catch (error) {
    console.error(error);
  }
};

async function visibility(data) {
  console.log("===========", data);
  try {
    visibility_data = {};
    if (data.post_id) {
      visibility_data.post_id = data.post_id;
    }

    if (
      data.user_id &&
      data.user_id.length > 0 &&
      data.visibilitySelectUsers == 2
    ) {
      
      data.user_id.split(',').forEach(async (element) => {
        visibility_data.not_visible = 1;
        visibility_data.user_id = element;

        var c = await save("visibility", visibility_data);
      });
    }
    if (
      data.user_id &&
      data.user_id.length > 0 &&
      data.visibilitySelectUsers == 3
    ) {
      
      data.user_id.split(',').forEach(async (element) => {
        visibility_data.user_id = element;

        var c = await save("visibility", visibility_data);
      });
    }
    if (
      data.user_id &&
      data.user_id.length > 0 &&
      data.visibilitySelectUsers == 4
    ) {
      visibility_data.user_id = data.login_user_id;
      data.user_id.split(',').forEach(async (element) => {
        visibility_data.not_visible = 1;
        visibility_data.group_id = element;

        var c = await save("visibility", visibility_data);
      });
    }

    } catch (error) {
    console.error(error);
  }
}

exports.getPostsAndEventsList = function (req, res) {
  var page = req.query.page ? req.query.page : 0;

	
    


  var condition =
    " ((events.visibilitySelectUsers=1 AND       (         (users_requests.user_id=" +    req.query.login_user_id +
    " AND users_requests.is_accepted=1  AND users_requests.is_reject=0  AND users_requests.is_block=0 ) OR (ur2.request_for=" +    req.query.login_user_id +
    " AND ur2.is_accepted=1  AND ur2.is_reject=0  AND ur2.is_block=0  )     OR  CASE WHEN (      SELECT GROUP_CONCAT(interest_id ORDER BY interest_id)   FROM users_interest      WHERE user_id = users.id GROUP BY users_interest.user_id  ) = (     SELECT GROUP_CONCAT(interest_id ORDER BY interest_id)      FROM users_interest      WHERE user_id = "+    req.query.login_user_id + " GROUP BY users_interest.user_id  ) THEN true ELSE false  END  )      )  OR visibility.user_id=" +    req.query.login_user_id +
    " OR groups_users.group_id=" +
    req.query.login_user_id +
    " ) AND (visibility.not_visible=0 OR visibility.not_visible IS NULL) ";


   
    if (req.query.myProfile == "1") {
      condition = " events.user_id	 ="+req.query.login_user_id;
    }  
  if (req.query.type == "feed") {
    condition += "  AND events.post_type=1 ";
    condition += " OR (events.user_id ="+req.query.login_user_id+" AND events.post_type=1  )"
  } else{
  if (req.query.type == "event") {
    condition += "  AND events.post_type=0   ";
    condition += " OR (events.user_id ="+req.query.login_user_id+" AND events.post_type=0  )"
  }else{
    condition += " OR events.user_id ="+req.query.login_user_id+" "

  }
}

  if (req.query.search!= '' && req.query.search!= undefined && req.query.search!= null) {
    condition += '  AND (events.title LIKE "%'+req.query.search+'%" OR events.venue LIKE "%'+req.query.search+'%" OR events.description LIKE "%'+req.query.search+'%" OR events.type LIKE "%'+req.query.search+'%" OR users.name LIKE "%'+req.query.search+'%") ';
  }

  // (SELECT  GROUP_CONCAT(users.profile_picture)  FROM attending LEFT JOIN users ON users.id=attending.user_id  WHERE attending.post_id=events.id  AND attending.user_id!=" +
  //   req.query.login_user_id +
  //   "  AND attending.attending_type=1 ) AS attending_users_image,

  sql =
    "SELECT events.description,CONCAT('" +
    constants.BASE_URL +
    "','images/postImage/',events.image) AS post_image,(SELECT count(*) AS likes_count FROM likes  WHERE likes.post_id=events.id AND likes.is_likes=1) AS liked_by,(SELECT count(*) AS likes_count FROM likes  WHERE likes.post_id=events.id) AS liked_by,(SELECT attending.attending_type FROM attending  WHERE attending.post_id=events.id AND attending.user_id!="+req.query.login_user_id+" LIMIT 1) AS attending_type,(SELECT COUNT(*) FROM attending  WHERE attending.post_id=events.id AND attending.attending_type=1 AND attending.user_id!=" +
    req.query.login_user_id +
    "  )   AS attending_users_count,  (SELECT  GROUP_CONCAT(users.profile_picture)  FROM attending LEFT JOIN users ON users.id=attending.user_id  WHERE attending.post_id=events.id  AND attending.user_id!=" +
    req.query.login_user_id +
    "  AND attending.attending_type=1 ) AS attending_users_image,   (SELECT likes.is_likes FROM likes  WHERE likes.liked_by=" +
    req.query.login_user_id +
      "  AND likes.post_id=events.id  LIMIT 1) AS is_liked,(SELECT comments.comment FROM comments  WHERE comments.post_id=events.id  ORDER BY comments.created_datetime DESC  LIMIT 1) AS comments,(SELECT users.name FROM comments LEFT JOIN users ON users.id=comments.comment_by WHERE comments.post_id=events.id  ORDER BY comments.created_datetime DESC  LIMIT 1) AS comments_by,TIMESTAMPDIFF(MINUTE, events.updated_datetime , CURRENT_TIMESTAMP) AS create_minute_ago,events.*,DATE_FORMAT(events.start_date, '%Y-%m-%d')  AS start_date,users.name,CONCAT('" +
      constants.BASE_URL +
      "','images/profiles/',users.profile_picture) AS profile_picture FROM  events LEFT JOIN users ON users.id=events.user_id LEFT JOIN visibility ON visibility.post_id=events.id    LEFT JOIN groups_users ON groups_users.group_id=visibility.group_id LEFT JOIN users_requests ON users_requests.request_for=users.id  LEFT JOIN users_requests ur2 ON ur2.user_id=users.id WHERE " +
    condition +
    " GROUP BY events.id  ORDER BY events.id DESC  Limit " +
    (page * 8) +
    ",8";
  console.log("===", sql);
  connection.query(sql, function (err, post_list) {
    console.log(err, post_list);
    if (post_list.length > 0) {
      var sqlCounts =
        
        "SELECT events.id FROM  events LEFT JOIN users ON users.id=events.user_id LEFT JOIN visibility ON visibility.post_id=events.id    LEFT JOIN groups_users ON groups_users.group_id=visibility.group_id LEFT JOIN users_requests ON users_requests.request_for=users.id        LEFT JOIN users_requests ur2 ON ur2.user_id=users.id WHERE "+condition+" GROUP BY events.id";
      connection.query(sqlCounts, function (err, counts) {
        if (err) {
          console.log(err);
        }
console.log(counts,"======sqlCounts==",sqlCounts);

        return res.json({
          response: post_list,
          totalPost: counts.length,
          // totalPost: counts[0].post_count,
          success: true,
          message: "post list",
        });
      });
    } else {
      return res.json({
        response: [],
        totalPost: 0,
        success: false,
        message: "No More post",
      });
    }
  });
};

exports.saveComment = async function (req, res) {
  if (req.body.comment_by && req.body.comment && req.body.post_id) {
    var data = {
      comment_by: req.body.comment_by,
      comment: req.body.comment,
      post_id: req.body.post_id,
    };

    var c = await save("comments", data);
    console.log("c====", c);
    if (c) {
      return res.json({ success: true, message: "commeted" });
    } else {
      return res.json({ success: false, message: "something went wrong" });
    }
  }
};
exports.getCommentListOnPosts = function (req, res) {
  var page = req.query.page ? req.query.page : 0;
  sql =
    "SELECT  comments.id,users.name,comments.comment , "+a+" ,(SELECT likes.is_likes FROM likes WHERE likes.liked_by="+req.query.login_user_id+" AND likes.comment_id=comments.id ) AS is_like,(SELECT COUNT(*) FROM likes WHERE likes.is_likes=1 AND likes.comment_id=comments.id ) AS comments_like_count FROM comments LEFT JOIN users ON users.id=comments.comment_by WHERE comments.post_id=" +
    req.query.post_id +
    " Limit " +
    page +
    ",8";
console.log("sql====",sql);
  connection.query(sql, function (err, comments_list) {
    console.log(err);
    if (comments_list.length > 0) {
      var sqlCounts =
        "SELECT count(*) AS likes_count FROM comments LEFT JOIN users ON users.id=comments.comment_by WHERE comments.post_id=" +
        req.query.post_id +
        "";
      connection.query(sqlCounts, function (err, total_comment) {
        if (err) {
          console.log(err);
        }

        return res.json({
          response: comments_list,
          total_comment: total_comment[0].comment_count,
          success: true,
          message: "Comments list .",
        });
      });
    }
  });
};



exports.postEvent = async function (req, res) {
  var data = {};
  if (req.file) {
    data.image = req.file.filename;
  }
  data.user_id = req.body.login_user_id;
  data.title =  req.body.title;
  data.type = req.body.type;
  data.start_date = req.body.start_date;
  data.end_date = req.body.end_date;
  data.start_time = req.body.start_time;
  data.end_time = req.body.end_time;
  data.venue = req.body.venue;
  data.description = req.body.description;
  data.visibilitySelectUsers = req.body.visibilitySelectUsers;
  data.post_datetime = new Date();
  var c = await save("events", data);
  console.log("c====", c);
  if (c) {
    if (req.body.visibilitySelectUsers != 1) {
      var visibility_data={};
      visibility_data.post_id = c;
      visibility_data.user_id = req.body.user_id;
      visibility_data.visibilitySelectUsers = req.body.visibilitySelectUsers;
      await visibility(visibility_data);
    }
  }
  return res.json({ success: true, message: "Event created ." });
};

exports.liked = async function (req, res) {
  if (req.body.liked_by && req.body.post_id) {
    sql =
      "SELECT * FROM likes  WHERE likes.post_id=" +
      req.body.post_id +
      "  AND likes.liked_by=" +
      req.body.liked_by +
      "";
    connection.query(sql, async function (err, likes_list) {
      console.log(err);

      if (likes_list.length == 0) {
        var c = await save("likes", {
          liked_by: req.body.liked_by,
          post_id: req.body.post_id,
        });
        console.log("c====", c);
        if (c) {
          return res.json({ success: true, message: "liked" });
        } else {
          return res.json({ success: false, message: c });
        }
      } else {
        var con =
          "likes.post_id=" +
          req.body.post_id +
          "  AND likes.liked_by=" +
          req.body.liked_by;
        if (likes_list[0].is_likes == 1) {
          findByIdAndUpdate("likes", { is_likes: 0 }, con);
          return res.json({ success: true, message: " Disliked" });
        }
        if (likes_list[0].is_likes == 0) {
          findByIdAndUpdate("likes", { is_likes: 1 }, con);
          return res.json({ success: true, message: " liked" });
        }
      }
    });
  }
};
exports.getLikedListOnPosts = function (req, res) {
  var page = req.query.page ? req.query.page : 0;
  sql =
    "SELECT users.name,CONCAT('" +
    constants.BASE_URL +
    "','images/profiles/',users.profile_picture) AS profile_picture FROM likes LEFT JOIN users ON users.id=likes.liked_by WHERE likes.post_id=" +
    req.query.post_id +
    " Limit " +
    page +
    ",8";

  connection.query(sql, function (err, likes_list) {
    console.log(err);
    var sqlCounts =
      "SELECT count(*) AS likes_count FROM likes LEFT JOIN users ON users.id=likes.liked_by WHERE likes.post_id=" +
      req.query.post_id +
      "";
    connection.query(sqlCounts, function (err, likes_count) {
      if (err) {
        console.log(err);
      }
      if (likes_list.length > 0) {
        return res.json({
          response: likes_list,
          total_comment: likes_count[0].likes_count,
          success: true,
          message: "likes list .",
        });
      } else {
        return res.json({
          response: likes_list,
          total_comment: likes_count[0].likes_count,
          success: true,
          message: "likes list .",
        });
      }
    });
  });
};

exports.attending = async function (req, res) {
  if (req.body.attending_type && req.body.login_user_id && req.body.post_id) {
    var data = {
      attending_type: req.body.attending_type,
      user_id: req.body.login_user_id,
      post_id: req.body.post_id,
    };

    var c = await save("attending", data);
    console.log("c====", c);
    if (c) {
      return res.json({ success: true, message: req.body.attending_type });
    } else {
      return res.json({ success: false, message: "" });
    }
  }
};
exports.likedOnComment = async function (req, res) {
  console.log(req.body)
  if (req.body.liked_by && req.body.comment_id) {
    sql =
      "SELECT * FROM likes  WHERE likes.comment_id=" +
      req.body.comment_id +
      "  AND likes.liked_by=" +
      req.body.liked_by +
      "";
      console.log("===",sql);
    connection.query(sql, async function (err, likes_list) {
      console.log(err);

      if (likes_list.length == 0) {
        var c = await save("likes", {
          liked_by: req.body.liked_by,
          comment_id: req.body.comment_id,
        });
        console.log("c====", c);
        if (c) {
          return res.json({ success: true, message: "liked" });
        } else {
          return res.json({ success: false, message: c });
        }
      } else {
        var con =
          "likes.comment_id=" +
          req.body.comment_id +
          "  AND likes.liked_by=" +
          req.body.liked_by;
        if (likes_list[0].is_likes == 1) {
          findByIdAndUpdate("likes", { is_likes: 0 }, con);
          return res.json({ success: true, message: " Disliked" });
        }
        if (likes_list[0].is_likes == 0) {
          findByIdAndUpdate("likes", { is_likes: 1 }, con);
          return res.json({ success: true, message: " liked" });
        }
      }
    });
  }
};



exports.getMyPostsAndEvent = function (req, res) {
  var page = req.query.page ? req.query.page : 0;

var condition=" "
  if (req.query.type == "feed") {
    condition += "  AND events.post_type=1 ";
  }
  if (req.query.type == "event") {
    condition += "  AND events.post_type=0   ";
  }


  sql =
    "SELECT events.title,CONCAT('" +
    constants.BASE_URL +
    "','images/postImage/',events.image) AS post_image FROM  events  WHERE user_id=" +
    req.query.login_user_id + condition
    " Limit " +
    (page*10) +
    ",10";

  connection.query(sql, function (err, postData) {
    console.log(err);
    var sqlCounts =
      "SELECT count(*) AS post_count FROM   events  WHERE user_id=" +
      req.query.login_user_id +
      condition+" ";
    connection.query(sqlCounts, function (err, post_count) {
      if (err) {
        console.log(err);
      }
      if (postData.length > 0) {
        return res.json({
          response: postData,
          total_comment: post_count[0].post_count,
          success: true,
          message: "post .",
        });
      } else {
        return res.json({
          response: postData,
          total_comment: post_count[0].post_count,
          success: true,
          message: "post .",
        });
      }
    });
  });
};

