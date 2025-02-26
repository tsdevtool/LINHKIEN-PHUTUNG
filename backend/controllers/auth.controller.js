import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
export const signup = async (req, res) => {
  try {
    const { phone, password, firstname, lastname, email } = req.body;
    if (!phone || !password || !firstname || !lastname) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const existingUserByUsername = await User.findOne({ phone: phone });
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại đã được sử dụng" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải ít nhất 6 ký tự",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email) {
      if (!emailRegex.test(email)) {
        return res
          .status(400)
          .json({ success: false, message: "Địa chỉ email không đúng" });
      }
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: "Địa chỉ email này đã được đăng ký",
        });
      }
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const image =
      "https://avatar.iran.liara.run/username?username=" + firstname;

    const newUser = new User({
      firstname,
      lastname,
      password: hashedPassword,
      phone,
      email,
      image,
    });
    generateTokenAndSetCookie(newUser._id, res);
    await newUser.save();
    res.status(201).json({
      success: true,
      user: {
        ...newUser._doc,
        password: "",
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Không để trống tài khoản và mật khẩu",
      });
    }

    const existingUserByPhone = await User.findOne({ phone });

    if (!existingUserByPhone) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy số điện thoại này" });
    }
    const isPasswordCorrect = await bcryptjs.compare(
      password,
      existingUserByPhone.password
    );

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu không đúng" });
    }

    generateTokenAndSetCookie(existingUserByPhone._id, res);

    res.status(200).json({
      success: true,
      user: {
        ...existingUserByPhone._doc,
        password: "",
      },
    });
  } catch (error) {
    console.log("Error in login controller");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("phu-tung-xe-may");
    res
      .status(200)
      .json({ success: true, message: "Đăng xuất thành công 😘😘" });
  } catch (error) {
    console.log("Error in logout controller");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const authCheck = async (req, res) => {
  try {
    res.status(200).json({ message: true, user: req.user });
  } catch (error) {
    console.log("Error in authCheck controller", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
