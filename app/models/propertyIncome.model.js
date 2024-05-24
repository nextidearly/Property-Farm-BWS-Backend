module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            amount: {
                type: Number,
                required: true,
            },
            property: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "property",
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

    const PropertyIncome = mongoose.model("propertyIncome", schema);
    return PropertyIncome;
};
