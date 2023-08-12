import {model,Schema} from 'mongoose'

const courseSchema = new Schema({
    title: {
        type:String,
        required:[true,'Title is required'],
        minLength:[8,'title must be 8 characters or more'],
        maxLength:[59,'Title should be lessthan 60 characters'],
        trim:true
    },
    description:{
        type: String,
        required:[true,'description is required'],
        minLength:[8,'description must be 8 characters or more'],
        maxLength:[200,'description should be lessthan 201 characters'],
        trim:true
    },
    category:{
        type: String,
        require:[true,'category is required']
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true
        },
        secure_url:{
            type:String,
            required:true
        }
    },
    lectures:[{
        title:String,
        description:String,
        lecture:{
            public_id:{
                type:String,
                required:true

            },
            secure_url:{
                type:String,
                required:true

            }
        }
    }],
    numberOfLectures : {
        type:Number,
        default:0
    },
    createdBy:{
        type:String,
        required:true

    }
},
{
    timestamps:true
})

const Course = new model('Course',courseSchema);
 export default Course;