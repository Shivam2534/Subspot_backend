const getApiKey = async (req, res) => {
    console.log("Request reached to get api key");
  
    const key = process.env.RAZORPAY_API_KEY;
  
    return res.status(200).json({
      key,
    });
  };
  
  export default getApiKey