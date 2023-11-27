const mongoose=require('mongoose')


const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  product: {
    type:mongoose.Types.ObjectId,
    ref:'product'
  },
  isDeleted:{
    type:Boolean,
    default:false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
}, { timestamps: true });

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner;
