module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            amount: {
                type: Number,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
        },
        { timestamps: true }
    );

    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const UserIncome = mongoose.model("userIncome", schema);
    return UserIncome;
};
