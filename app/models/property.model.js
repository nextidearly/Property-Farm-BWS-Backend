module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            title: {
                type: String,
                require: true,
            },
            description: {
                type: String,
                require: true
            },
            supply: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                require: true,
            },
            inscriptionId: {
                type: String,
                required: true,
            },
            sold: {
                type: Number,
            },
            status: {
                type: String,
            },
            startsIn: {
                type: String,
            }
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Property = mongoose.model("property", schema);
    return Property;
};
