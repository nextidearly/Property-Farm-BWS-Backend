module.exports = (mongoose) => {
    var schema = mongoose.Schema(
        {
            inscriptionId: {
                type: String,
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

    const Inscription = mongoose.model("inscription", schema);
    return Inscription;
};
