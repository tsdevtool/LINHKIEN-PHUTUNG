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
    unique: true 
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
  address: {
     type: String,
     required: false,
  },
  image: {
    type: String,
    default: "",
  },

  numberOfOrders: { 
    type: Number, default: 0 
  },
  totalSpent: { 
    type: Number, default: 0.0 
  },
  idrole: { 
    type: String, ref: "Role" 
  },
  status: { 
    type: Boolean, default: true 
  },
  created_at: { 
    type: Date, default: Date.now 
  },
  updated_at: { 
    type: Date, default: Date.now 
  },
  deleted_at: { 
    type: Date, default: null 
  }
});

export const User = mongoose.model("users", userSchema);
