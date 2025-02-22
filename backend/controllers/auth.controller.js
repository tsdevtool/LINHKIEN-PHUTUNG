export const signup = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in signup controller");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in login controller");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in logout controller");
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
