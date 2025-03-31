import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  //so dien thoai dong thoi se la username
  phone: {
    type: String,
    required: true,
  },
  //Mat khau duoc luu duoi dang hash chu khong luu de co the nhin thay truc tiep
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false, //khong bat buoc co mail boi neu khach hang den truc tiep thi chi can sdt la du
  },
  image: {
    type: String,
    default: "",
  },

  deliveryAddress: {
    type: Array,
    default: [],
  },
  //Cai nay kieu se luu mot so thong tin tim kiem gan nhat cua nguoi dung
  //khi nguoi dung nhap vao tim kiem se hien 4-5 cai tim kiem de de cho lua
  searchHistory: {
    type: Array,
    default: [],
  },
  //So lan dat hang cua nguoi dung de biet nguoi dung la khach vang lai hay khach than thuoc
  numberOfOrder: {
    type: Number,
    default: 0,
  },
});

export const User = mongoose.model("users", userSchema);
